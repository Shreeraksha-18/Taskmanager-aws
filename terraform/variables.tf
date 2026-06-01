variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "taskmanager"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "db_password" {
  sensitive = true
}

variable "ami_id" {
  default = "ami-0440d3b780d96b29d"
}

variable "github_repo" {}