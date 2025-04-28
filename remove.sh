#!/bin/bash
set -euo pipefail
export AWS_PAGER=""
mkdir -p old-error/
cp -r error/* old-error/
rm -rf error/
mkdir -p error

# ─────────────────────────────────────────────
# Helper: progress handling
# ─────────────────────────────────────────────
start_step() { printf "🔸 %s...\r" "$1"; }
end_step_ok() { printf "\r\033[K✅ %s\n" "$1"; }
end_step_fail() { printf "\r\033[K❌ %s (see %s)\n" "$1" "$2"; }

timestamp() {
  date '+%Y%m%d-%H%M%S'
}

safe_run() {
  local cmd="$1"
  local task="$2"
  local errfile="error/${task}-$(timestamp).txt"
  
  if eval "$cmd" > /dev/null 2> "$errfile"; then
    return 0
  else
    return 1
  fi
}

# ─────────────────────────────────────────────
echo "⚡ Starting AWS resource cleanup..."

# --- SQS ---
start_step "Deleting SQS queues"
queues=$(aws sqs list-queues --output json | jq -r '.QueueUrls[]?')
if [[ -n "$queues" ]]; then
  for q in $queues; do safe_run "aws sqs delete-queue --queue-url \"$q\" --output json" "sqs-delete"; done
  end_step_ok "All SQS queues deleted."
else
  end_step_ok "No SQS queues found."
fi

# --- S3 ---
start_step "Deleting S3 buckets"
buckets=$(aws s3api list-buckets --output json | jq -r '.Buckets[].Name')
if [[ -n "$buckets" ]]; then
  for b in $buckets; do
    safe_run "aws s3 rm \"s3://$b\" --recursive" "s3-empty" || true
    safe_run "aws s3api delete-bucket --bucket \"$b\" --output json" "s3-delete"
  done
  end_step_ok "All S3 buckets deleted."
else
  end_step_ok "No S3 buckets found."
fi

# --- DynamoDB ---
start_step "Deleting DynamoDB tables"
tables=$(aws dynamodb list-tables --output json | jq -r '.TableNames[]?')
if [[ -n "$tables" ]]; then
  for t in $tables; do safe_run "aws dynamodb delete-table --table-name \"$t\" --output json" "dynamodb-delete"; done
  end_step_ok "All DynamoDB tables deleted."
else
  end_step_ok "No DynamoDB tables found."
fi

# --- Lambda ---
start_step "Deleting Lambda functions"
lambdas=$(aws lambda list-functions --output json | jq -r '.Functions[].FunctionName')
if [[ -n "$lambdas" ]]; then
  for f in $lambdas; do safe_run "aws lambda delete-function --function-name \"$f\" --output json" "lambda-delete"; done
  end_step_ok "All Lambda functions deleted."
else
  end_step_ok "No Lambda functions found."
fi

# --- CloudFormation ---
start_step "Deleting CloudFormation stacks"
stacks=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --output json | jq -r '.StackSummaries[].StackName')
if [[ -n "$stacks" ]]; then
  for s in $stacks; do safe_run "aws cloudformation delete-stack --stack-name \"$s\" --output json" "cfn-delete"; done
  end_step_ok "All CloudFormation stacks deletion triggered."
else
  end_step_ok "No CloudFormation stacks found."
fi

# --- API Gateway ---
start_step "Deleting API Gateway REST APIs"
apis=$(aws apigateway get-rest-apis --output json | jq -r '.items[].id')
if [[ -n "$apis" ]]; then
  for a in $apis; do safe_run "aws apigateway delete-rest-api --rest-api-id \"$a\" --output json" "apigateway-delete"; done
  end_step_ok "All API Gateway APIs deleted."
else
  end_step_ok "No API Gateway REST APIs found."
fi

# --- IAM Roles ---
start_step "Deleting IAM roles"
roles=$(aws iam list-roles --output json | jq -r '.Roles[].RoleName')
iam_error=false
if [[ -n "$roles" ]]; then
  for r in $roles; do
    [[ "$r" == AWSServiceRoleFor* ]] && continue
    attached=$(aws iam list-attached-role-policies --role-name "$r" --output json | jq -r '.AttachedPolicies[].PolicyArn')
    for p in $attached; do
      safe_run "aws iam detach-role-policy --role-name \"$r\" --policy-arn \"$p\" --output json" "iam-detach" || iam_error=true
    done
    safe_run "aws iam delete-role --role-name \"$r\" --output json" "iam-delete" || iam_error=true
  done
fi
if [[ "$iam_error" == true ]]; then
  end_step_fail "IAM role deletion encountered errors" "error/iam-delete-$(timestamp).txt"
else
  end_step_ok "All IAM roles deleted (service-linked skipped)."
fi

# --- EC2 ---
start_step "Terminating EC2 instances"
instances=$(aws ec2 describe-instances --output json | jq -r '.Reservations[].Instances[].InstanceId')
if [[ -n "$instances" ]]; then
  safe_run "aws ec2 terminate-instances --instance-ids $instances --output json" "ec2-terminate" && end_step_ok "All EC2 instances termination triggered." || end_step_fail "EC2 termination error" "error/ec2-terminate-$(timestamp).txt"
else
  end_step_ok "No EC2 instances found."
fi

# --- ECS ---
start_step "Deleting ECS clusters & services"
clusters=$(aws ecs list-clusters --output json | jq -r '.clusterArns[]?')
if [[ -n "$clusters" ]]; then
  for c in $clusters; do
    svcs=$(aws ecs list-services --cluster "$c" --output json | jq -r '.serviceArns[]?')
    [[ -n "$svcs" ]] && safe_run "aws ecs delete-service --cluster \"$c\" --service \"$svcs\" --force --output json" "ecs-service-delete"
    safe_run "aws ecs delete-cluster --cluster \"$c\" --output json" "ecs-cluster-delete"
  done
  end_step_ok "All ECS clusters deleted."
else
  end_step_ok "No ECS clusters found."
fi

# --- RDS ---
start_step "Deleting RDS instances"
rds=$(aws rds describe-db-instances --output json | jq -r '.DBInstances[].DBInstanceIdentifier')
if [[ -n "$rds" ]]; then
  for d in $rds; do
    safe_run "aws rds delete-db-instance --db-instance-identifier \"$d\" --skip-final-snapshot --delete-automated-backups --output json" "rds-delete"
  done
  end_step_ok "All RDS instances deletion triggered."
else
  end_step_ok "No RDS instances found."
fi

# --- CloudWatch Logs ---
start_step "Deleting CloudWatch log groups"
logs=$(aws logs describe-log-groups --output json | jq -r '.logGroups[].logGroupName')
if [[ -n "$logs" ]]; then
  for l in $logs; do safe_run "aws logs delete-log-group --log-group-name \"$l\" --output json" "cloudwatch-delete"; done
  end_step_ok "All CloudWatch log groups deleted."
else
  end_step_ok "No CloudWatch log groups found."
fi

echo "🎉 Cleanup completed!"