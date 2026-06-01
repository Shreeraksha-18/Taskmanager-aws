output "sg_ec2_id" {
  value = aws_security_group.ec2.id
}
output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}
output "ec2_public_dns" {
  value = aws_instance.app.public_dns
}