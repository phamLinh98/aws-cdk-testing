#!/bin/bash

set -euo pipefail
export AWS_PAGER=""

echo "⚡ Starting AWS resource cleanup..."

# --- SQS ---
echo "🔸 Deleting SQS queues..."
queues=$(aws sqs list-queues --output json | jq -r '.QueueUrls[]?')
if [[ -z "$queues" ]]; then
    echo "✅ No SQS queues found."
else
    for queue_url in $queues; do
        echo "Deleting SQS queue: $queue_url"
        aws sqs delete-queue --queue-url "$queue_url" --output json
    done
    echo "✅ All SQS queues deleted."
fi

# --- S3 ---
echo "🔸 Deleting S3 buckets..."
buckets=$(aws s3api list-buckets --output json | jq -r '.Buckets[].Name')
if [[ -z "$buckets" ]]; then
    echo "✅ No S3 buckets found."
else
    for bucket in $buckets; do
        echo "Emptying and deleting S3 bucket: $bucket"
        aws s3 rm "s3://$bucket" --recursive || true
        aws s3api delete-bucket --bucket "$bucket" --output json
    done
    echo "✅ All S3 buckets deleted."
fi

# --- DynamoDB ---
echo "🔸 Deleting DynamoDB tables..."
tables=$(aws dynamodb list-tables --output json | jq -r '.TableNames[]?')
if [[ -z "$tables" ]]; then
    echo "✅ No DynamoDB tables found."
else
    for table in $tables; do
        echo "Deleting DynamoDB table: $table"
        aws dynamodb delete-table --table-name "$table" --output json
    done
    echo "✅ All DynamoDB tables deleted."
fi

# --- Lambda ---
echo "🔸 Deleting Lambda functions..."
lambdas=$(aws lambda list-functions --output json | jq -r '.Functions[].FunctionName')
if [[ -z "$lambdas" ]]; then
    echo "✅ No Lambda functions found."
else
    for function in $lambdas; do
        echo "Deleting Lambda function: $function"
        aws lambda delete-function --function-name "$function" --output json
    done
    echo "✅ All Lambda functions deleted."
fi

# --- CloudFormation Stacks ---
echo "🔸 Deleting CloudFormation stacks..."
stacks=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --output json | jq -r '.StackSummaries[].StackName')
if [[ -z "$stacks" ]]; then
    echo "✅ No CloudFormation stacks found."
else
    for stack in $stacks; do
        echo "Deleting CloudFormation stack: $stack"
        aws cloudformation delete-stack --stack-name "$stack" --output json
    done
    echo "✅ All CloudFormation stacks deletion triggered."
fi

# --- API Gateway REST APIs ---
echo "🔸 Deleting API Gateway REST APIs..."
apis=$(aws apigateway get-rest-apis --output json | jq -r '.items[].id')
if [[ -z "$apis" ]]; then
    echo "✅ No API Gateway REST APIs found."
else
    for api_id in $apis; do
        echo "Deleting API Gateway API ID: $api_id"
        aws apigateway delete-rest-api --rest-api-id "$api_id" --output json
    done
    echo "✅ All API Gateway APIs deleted."
fi

# --- IAM Roles and Policies ---
echo "🔸 Deleting IAM roles and attached policies..."
roles=$(aws iam list-roles --output json | jq -r '.Roles[].RoleName')
if [[ -z "$roles" ]]; then
    echo "✅ No IAM roles found."
else
    for role in $roles; do
        if [[ "$role" == AWSServiceRoleFor* ]]; then
            echo "Skipping AWS managed service-linked role: $role"
            continue
        fi
        echo "Detaching policies from role: $role"
        attached_policies=$(aws iam list-attached-role-policies --role-name "$role" --output json | jq -r '.AttachedPolicies[].PolicyArn')
        for policy_arn in $attached_policies; do
            aws iam detach-role-policy --role-name "$role" --policy-arn "$policy_arn" --output json
        done
        echo "Deleting role: $role"
        aws iam delete-role --role-name "$role" --output json || true
    done
    echo "✅ All IAM roles deleted."
fi

# --- EC2 Instances ---
echo "🔸 Terminating EC2 instances..."
instances=$(aws ec2 describe-instances --output json | jq -r '.Reservations[].Instances[].InstanceId')
if [[ -z "$instances" ]]; then
    echo "✅ No EC2 instances found."
else
    aws ec2 terminate-instances --instance-ids $instances --output json
    echo "✅ All EC2 instances termination triggered."
fi

# --- ECS Clusters and Services ---
echo "🔸 Deleting ECS services and clusters..."
clusters=$(aws ecs list-clusters --output json | jq -r '.clusterArns[]?')
if [[ -z "$clusters" ]]; then
    echo "✅ No ECS clusters found."
else
    for cluster in $clusters; do
        services=$(aws ecs list-services --cluster "$cluster" --output json | jq -r '.serviceArns[]?')
        for service in $services; do
            echo "Deleting ECS service: $service in cluster: $cluster"
            aws ecs delete-service --cluster "$cluster" --service "$service" --force --output json
        done
        echo "Deleting ECS cluster: $cluster"
        aws ecs delete-cluster --cluster "$cluster" --output json
    done
    echo "✅ All ECS clusters deleted."
fi

# --- RDS Instances ---
echo "🔸 Deleting RDS instances..."
rds_instances=$(aws rds describe-db-instances --output json | jq -r '.DBInstances[].DBInstanceIdentifier')
if [[ -z "$rds_instances" ]]; then
    echo "✅ No RDS instances found."
else
    for db in $rds_instances; do
        echo "Deleting RDS instance: $db"
        aws rds delete-db-instance --db-instance-identifier "$db" --skip-final-snapshot --delete-automated-backups --output json
    done
    echo "✅ All RDS instances deletion triggered."
fi

# --- CloudWatch Log Groups ---
echo "🔸 Deleting CloudWatch Log Groups..."
log_groups=$(aws logs describe-log-groups --output json | jq -r '.logGroups[].logGroupName')
if [[ -z "$log_groups" ]]; then
    echo "✅ No CloudWatch log groups found."
else
    for log_group in $log_groups; do
        echo "Deleting CloudWatch log group: $log_group"
        aws logs delete-log-group --log-group-name "$log_group" --output json
    done
    echo "✅ All CloudWatch log groups deleted."
fi

echo "🎉 All specified AWS resources have been cleaned up successfully!"