resource "aws_ecr_repository" "frontend" {
  name = "iim-project-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "backend" {
  name = "iim-project-backend"

  image_scanning_configuration {
    scan_on_push = true
  }
}
