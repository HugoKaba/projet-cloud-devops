resource "aws_cloudfront_distribution" "app_distribution" {
  origin {
    domain_name = aws_instance.app_server.public_dns
    origin_id   = "EC2-${aws_instance.app_server.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "EC2-${aws_instance.app_server.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Host", "CloudFront-Forwarded-Proto"]
      
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  ordered_cache_behavior {
    path_pattern           = "static/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "EC2-${aws_instance.app_server.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      headers      = []
      
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 31536000
    default_ttl = 31536000
    max_ttl     = 31536000
  }

  ordered_cache_behavior {
    path_pattern           = "api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "EC2-${aws_instance.app_server.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["FR", "US", "CA", "GB", "DE", "ES", "IT", "JP"]
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  comment             = "IIM-Project-CloudFront"

  tags = {
    Name        = "IIM-Project-CloudFront"
    Environment = "production"
    Project     = "Cloud-DevOps-IIM"
  }
}

resource "aws_s3_bucket" "cloudfront_logs" {
  bucket = "iim-project-cloudfront-logs-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "IIM-Project-CloudFront-Logs"
    Environment = "production"
  }
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_logs_ownership" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "cloudfront_logs_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.cloudfront_logs_ownership]
  
  bucket = aws_s3_bucket.cloudfront_logs.id
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs_encryption" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_error_rate" {
  alarm_name          = "cloudfront-4xx-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5"
  alarm_description   = "This metric monitors CloudFront 4xx error rate"
  
  dimensions = {
    DistributionId = aws_cloudfront_distribution.app_distribution.id
  }

  tags = {
    Name = "IIM-Project-CloudFront-4xx-Errors"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_error_rate" {
  alarm_name          = "cloudfront-5xx-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors CloudFront 5xx error rate"
  
  dimensions = {
    DistributionId = aws_cloudfront_distribution.app_distribution.id
  }

  tags = {
    Name = "IIM-Project-CloudFront-5xx-Errors"
  }
}
