variable "project_name" {}
variable "vpc_id"       {}
variable "subnet_ids"   { type = list(string) }
variable "sg_ec2_id"    {}
variable "db_password"  { sensitive = true }