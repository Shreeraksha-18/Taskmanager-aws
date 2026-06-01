variable "project_name" {}
variable "vpc_id"       {}
variable "subnet_id"    {}
variable "ami_id"       {}
variable "db_host"      {}
variable "db_password"  { sensitive = true }
variable "github_repo"  {}