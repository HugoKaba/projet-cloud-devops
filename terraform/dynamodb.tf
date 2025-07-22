resource "aws_dynamodb_table" "app_table" {
  name           = "iim-project-data"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "IIM-Project-Table"
  }
}
