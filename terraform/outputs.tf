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
