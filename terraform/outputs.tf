output "instance_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_eip.app_eip.public_ip
}

output "instance_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.app_server.public_dns
}
