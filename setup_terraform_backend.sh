#!/bin/bash
set -e

AWS_REGION="eu-west-1"
BUCKET_NAME="terraform-state-$(date +%s)"
DYNAMODB_TABLE="terraform-lock-prod"

aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws dynamodb create-table \
    --table-name $DYNAMODB_TABLE \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION 2>/dev/null || true

aws dynamodb wait table-exists --table-name $DYNAMODB_TABLE --region $AWS_REGION

cat > terraform/prod.s3.tfbackend <<EOF
bucket         = "$BUCKET_NAME"
key            = "prod/terraform.tfstate"
region         = "$AWS_REGION"
dynamodb_table = "$DYNAMODB_TABLE"
encrypt        = true
EOF

cd terraform
terraform init -backend-config=prod.s3.tfbackend

echo "✅ Backend prêt. Configurez vos secrets GitHub et pushez pour déployer !"
