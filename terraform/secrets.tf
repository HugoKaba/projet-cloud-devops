resource "random_id" "secret_suffix" {
  byte_length = 4

  keepers = {
    version = "v1"
  }
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "project-secrets-${random_id.secret_suffix.hex}"
  description             = "Application secrets for IIM project - ${formatdate("YYYY-MM-DD", timestamp())}"
  recovery_window_in_days = 7

  tags = {
    Environment = "production"
    Project     = "IIM-Cloud-DevOps"
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    database_url   = "dynamodb://${var.aws_region}/${aws_dynamodb_table.app_table.name}"
    database_table = aws_dynamodb_table.app_table.name
    environment    = "production"
    region         = var.aws_region
    instance_id    = aws_instance.app_server.id
    api_endpoint   = "http://${aws_eip.app_eip.public_ip}:3001"
  })
}

resource "aws_iam_role_policy" "secrets_manager_access" {
  name = "Secrets-Manager-Access-Policy"
  role = aws_iam_role.ec2_ssm_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.app_secrets.arn
        ]
      }
    ]
  })
}

output "secret_name" {
  value       = aws_secretsmanager_secret.app_secrets.name
  description = "Nom du secret AWS Secrets Manager"
}

output "secret_arn" {
  value       = aws_secretsmanager_secret.app_secrets.arn
  description = "ARN du secret AWS Secrets Manager"
}
