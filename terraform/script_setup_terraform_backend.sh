#!/bin/bash

set -e

BUCKET_NAME="hugo-terraform-state-prod-$(date +%s)"
DYNAMODB_TABLE="terraform-state-lock-prod"
AWS_REGION="eu-west-1"

aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws dynamodb create-table \
    --table-name $DYNAMODB_TABLE \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION

aws dynamodb wait table-exists --table-name $DYNAMODB_TABLE --region $AWS_REGION

cat > terraform/prod.s3.tfbackend << EOF
bucket         = "$BUCKET_NAME"
key            = "prod/terraform.tfstate"
region         = "$AWS_REGION"
dynamodb_table = "$DYNAMODB_TABLE"
encrypt        = true
EOF

cd terraform
if [ -f terraform.tfstate ]; then
    cp terraform.tfstate terraform.tfstate.backup.$(date +%Y%m%d_%H%M%S)
fi

terraform init -backend-config=/prod.s3.tfbackend
