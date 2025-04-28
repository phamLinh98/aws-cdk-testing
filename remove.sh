#!/bin/bash
set -euo pipefail
export AWS_PAGER=""

# ─────────────────────────────────────────────
# Helper: in-place progress + final success log
# ─────────────────────────────────────────────
start_step() { printf "🔸 %s...\r" "$1"; }          # hiển thị 1 dòng, không xuống hàng
end_step()   { printf "\r\033[K✅ %s\n" "$1"; }     # xoá dòng & in kết quả ✅

# ─────────────────────────────────────────────
echo "⚡ Starting AWS resource cleanup..."

# --- SQS ---
start_step "Deleting SQS queues"
queues=$(aws sqs list-queues --output json | jq -r '.QueueUrls[]?' )
if [[ -n "$queues" ]]; then
  for q in $queues; do aws sqs delete-queue --queue-url "$q" --output json >/dev/null; done
  end_step "All SQS queues deleted."
else
  end_step "No SQS queues found."
fi

# --- S3 ---
start_step "Deleting S3 buckets"
buckets=$(aws s3api list-buckets --output json | jq -r '.Buckets[].Name')
if [[ -n "$buckets" ]]; then
  for b in $buckets; do
    aws s3 rm "s3://$b" --recursive >/dev/null 2>&1 || true
    aws s3api delete-bucket --bucket "$b" --output json >/dev/null
  done
  end_step "All S3 buckets deleted."
else
  end_step "No S3 buckets found."
fi

# --- DynamoDB ---
start_step "Deleting DynamoDB tables"
tables=$(aws dynamodb list-tables --output json | jq -r '.TableNames[]?' )
if [[ -n "$tables" ]]; then
  for t in $tables; do aws dynamodb delete-table --table-name "$t" --output json >/dev/null; done
  end_step "All DynamoDB tables deleted."
else
  end_step "No DynamoDB tables found."
fi

# --- Lambda ---
start_step "Deleting Lambda functions"
lambdas=$(aws lambda list-functions --output json | jq -r '.Functions[].FunctionName')
if [[ -n "$lambdas" ]]; then
  for f in $lambdas; do aws lambda delete-function --function-name "$f" --output json >/dev/null; done
  end_step "All Lambda functions deleted."
else
  end_step "No Lambda functions found."
fi

# --- CloudFormation ---
start_step "Deleting CloudFormation stacks"
stacks=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --output json | jq -r '.StackSummaries[].StackName')
if [[ -n "$stacks" ]]; then
  for s in $stacks; do aws cloudformation delete-stack --stack-name "$s" --output json >/dev/null; done
  end_step "All CloudFormation stacks deletion triggered."
else
  end_step "No CloudFormation stacks found."
fi

# --- API Gateway ---
start_step "Deleting API Gateway REST APIs"
apis=$(aws apigateway get-rest-apis --output json | jq -r '.items[].id')
if [[ -n "$apis" ]]; then
  for a in $apis; do aws apigateway delete-rest-api --rest-api-id "$a" --output json >/dev/null; done
  end_step "All API Gateway APIs deleted."
else
  end_step "No API Gateway REST APIs found."
fi

# --- IAM Roles ---
start_step "Deleting IAM roles"
roles=$(aws iam list-roles --output json | jq -r '.Roles[].RoleName')
if [[ -n "$roles" ]]; then
  for r in $roles; do
    [[ "$r" == AWSServiceRoleFor* ]] && continue     # skip service-linked
    attached=$(aws iam list-attached-role-policies --role-name "$r" --output json | jq -r '.AttachedPolicies[].PolicyArn')
    for p in $attached; do aws iam detach-role-policy --role-name "$r" --policy-arn "$p" --output json >/dev/null; done
    aws iam delete-role --role-name "$r" --output json >/dev/null || true
  done
  end_step "All IAM roles deleted (service-linked skipped)."
else
  end_step "No IAM roles found."
fi

# --- EC2 ---
start_step "Terminating EC2 instances"
instances=$(aws ec2 describe-instances --output json | jq -r '.Reservations[].Instances[].InstanceId')
if [[ -n "$instances" ]]; then
  aws ec2 terminate-instances --instance-ids $instances --output json >/dev/null
  end_step "All EC2 instances termination triggered."
else
  end_step "No EC2 instances found."
fi

# --- ECS ---
start_step "Deleting ECS clusters & services"
clusters=$(aws ecs list-clusters --output json | jq -r '.clusterArns[]?')
if [[ -n "$clusters" ]]; then
  for c in $clusters; do
    svcs=$(aws ecs list-services --cluster "$c" --output json | jq -r '.serviceArns[]?')
    [[ -n "$svcs" ]] && aws ecs delete-service --cluster "$c" --service "$svcs" --force --output json >/dev/null
    aws ecs delete-cluster --cluster "$c" --output json >/dev/null
  done
  end_step "All ECS clusters deleted."
else
  end_step "No ECS clusters found."
fi

# --- RDS ---
start_step "Deleting RDS instances"
rds=$(aws rds describe-db-instances --output json | jq -r '.DBInstances[].DBInstanceIdentifier')
if [[ -n "$rds" ]]; then
  for d in $rds; do
    aws rds delete-db-instance --db-instance-identifier "$d" --skip-final-snapshot --delete-automated-backups --output json >/dev/null
  done
  end_step "All RDS instances deletion triggered."
else
  end_step "No RDS instances found."
fi

# --- CloudWatch Logs ---
start_step "Deleting CloudWatch log groups"
logs=$(aws logs describe-log-groups --output json | jq -r '.logGroups[].logGroupName')
if [[ -n "$logs" ]]; then
  for l in $logs; do aws logs delete-log-group --log-group-name "$l" --output json >/dev/null; done
  end_step "All CloudWatch log groups deleted."
else
  end_step "No CloudWatch log groups found."
fi

echo "🎉 Cleanup completed!"