resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "project-secrets"
  description = "Application secrets for IIM project"
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    database_url = "dynamodb://eu-west-1/${aws_dynamodb_table.app_table.name}"
    environment  = "production"
  })
}
