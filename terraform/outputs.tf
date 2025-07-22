output "instance_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_eip.app_eip.public_ip
}

output "instance_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "instance_id" {
  description = "ID of EC2 instance for SSM connection"
  value       = aws_instance.app_server.id
}

output "ssm_connection_command" {
  description = "Command to connect via SSM"
  value       = "aws ssm start-session --target ${aws_instance.app_server.id}"
}

output "application_url" {
  description = "URL of the deployed application"
  value       = "http://${aws_eip.app_eip.public_ip}"
}

output "api_health_url" {
  description = "API health check endpoint"
  value       = "http://${aws_eip.app_eip.public_ip}/api/health"
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.app_table.name
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch Dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.app_distribution.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution Domain Name"
  value       = aws_cloudfront_distribution.app_distribution.domain_name
}

output "cloudfront_url" {
  description = "CloudFront Distribution URL"
  value       = "https://${aws_cloudfront_distribution.app_distribution.domain_name}"
}

output "cloudfront_zone_id" {
  description = "CloudFront Distribution Hosted Zone ID"
  value       = aws_cloudfront_distribution.app_distribution.hosted_zone_id
}

output "cloudfront_status" {
  description = "CloudFront Distribution Status"
  value       = aws_cloudfront_distribution.app_distribution.status
}
