resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/iim-project/application"
  retention_in_days = 7

  tags = {
    Name        = "IIM-Project-Logs"
    Environment = "production"
  }
}

resource "aws_cloudwatch_log_group" "container_logs" {
  name              = "/aws/ec2/containers"
  retention_in_days = 3

  tags = {
    Name        = "IIM-Project-Container-Logs"
    Environment = "production"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "iim-project-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Cette métrique surveille l'utilisation CPU de l'instance EC2"
  alarm_actions       = []

  dimensions = {
    InstanceId = aws_instance.app_server.id
  }

  tags = {
    Name = "IIM-Project-CPU-Alarm"
  }
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "IIM-Project-Dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.app_server.id],
            [".", "NetworkIn", ".", "."],
            [".", "NetworkOut", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "EC2 Instance Metrics"
          period  = 300
        }
      }
    ]
  })
}
