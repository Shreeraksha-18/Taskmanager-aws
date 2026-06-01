resource "aws_security_group" "ec2" {
  name   = "${var.project_name}-sg-ec2"
  vpc_id = var.vpc_id

  ingress {
    description = "API port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-ec2" }
}

locals {
  user_data = <<-USERDATA
#!/bin/bash
set -e
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git
npm install -g pm2
cd /home/ec2-user
git clone https://github.com/${var.github_repo} app
cd app/backend
npm ci --only=production
cat > /home/ec2-user/app/backend/.env << ENVEOF
DB_HOST=${var.db_host}
DB_PORT=5432
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=${var.db_password}
NODE_ENV=production
PORT=3000
ENVEOF
chown -R ec2-user:ec2-user /home/ec2-user/app
sudo -u ec2-user bash -c "cd /home/ec2-user/app/backend && pm2 start src/index.js --name taskmanager && pm2 save"
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
systemctl enable pm2-ec2-user
USERDATA
}

resource "aws_instance" "app" {
  ami                         = var.ami_id
  instance_type               = "t2.micro"
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  associate_public_ip_address = true
  user_data                   = base64encode(local.user_data)
  user_data_replace_on_change = true

  root_block_device {
    volume_type = "gp2"
    volume_size = 8
  }

  tags = { Name = "${var.project_name}-ec2" }
}