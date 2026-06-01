terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
  aws_region   = var.aws_region
}

module "ec2" {
  source       = "./modules/ec2"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  subnet_id    = module.vpc.public_subnet_ids[0]
  ami_id       = var.ami_id
  db_host      = module.rds.db_endpoint
  db_password  = var.db_password
  github_repo  = var.github_repo
}

module "rds" {
  source       = "./modules/rds"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.public_subnet_ids
  sg_ec2_id    = module.ec2.sg_ec2_id
  db_password  = var.db_password
}

resource "random_password" "cf_secret" {
  length  = 32
  special = false
}

module "cdn" {
  source         = "./modules/cdn"
  project_name   = var.project_name
  ec2_public_dns = module.ec2.ec2_public_dns
  cf_secret      = random_password.cf_secret.result
}