output "cloudfront_url" {
  value = module.cdn.cloudfront_url
}
output "ec2_public_ip" {
  value = module.ec2.ec2_public_ip
}
output "rds_endpoint" {
  value = module.rds.db_endpoint
}
output "s3_bucket_name" {
  value = module.cdn.s3_bucket_name
}
output "cf_distribution_id" {
  value = module.cdn.cf_distribution_id
}