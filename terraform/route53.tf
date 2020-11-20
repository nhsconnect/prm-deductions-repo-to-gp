locals {
  deductions_private_internal_alb_dns = data.aws_ssm_parameter.deductions_private_alb_internal_dns.value
  zone_id = data.aws_ssm_parameter.root_zone_id.value
  private_zone_id = data.aws_ssm_parameter.private_zone_id.value
}

resource "aws_route53_record" "repo-to-gp-r53-private-record" {
  zone_id = data.aws_ssm_parameter.private_zone_id.value
  name    = "${var.environment}.${var.dns_name}"
  type    = "CNAME"
  ttl     = "300"
  records = [local.deductions_private_internal_alb_dns]
}
