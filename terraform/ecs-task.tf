locals {
  task_execution_role = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.environment}-${var.component_name}-EcsTaskRole"
  task_ecr_url        = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com"
  task_log_group      = "/nhs/deductions/${var.environment}-${data.aws_caller_identity.current.account_id}/${var.component_name}"
  environment_variables = [
    { name = "NHS_ENVIRONMENT", value = var.environment },
    { name = "SERVICE_URL", value = "https://repo-to-gp.${var.environment}.non-prod.patient-deductions.nhs.uk" },
    { name = "GP2GP_ADAPTOR_SERVICE_URL", value = "https://gp2gp-adaptor.${var.environment}.non-prod.patient-deductions.nhs.uk" },
    { name = "EHR_REPO_SERVICE_URL", value = "https://ehr-repo.${var.environment}.non-prod.patient-deductions.nhs.uk" },
    { name = "DATABASE_NAME", value = var.database_name },
    { name = "DATABASE_HOST", value = data.aws_ssm_parameter.rds_endpoint.value }
  ]
  secret_environment_variables = [
    { name = "AUTHORIZATION_KEYS", valueFrom = data.aws_ssm_parameter.authorization_keys.arn },
    { name = "GP2GP_ADAPTOR_AUTHORIZATION_KEYS", valueFrom = data.aws_ssm_parameter.gp2gp_adaptor_authorization_keys.arn },
    { name = "EHR_REPO_AUTHORIZATION_KEYS", valueFrom = data.aws_ssm_parameter.ehr_repo_authorization_keys.arn },
    { name = "DATABASE_USER", valueFrom = data.aws_ssm_parameter.db-username.arn },
    { name = "DATABASE_PASSWORD", valueFrom = data.aws_ssm_parameter.db-password.arn }
  ]
}

resource "aws_ecs_task_definition" "task" {
  family                   = var.component_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = local.task_execution_role


  container_definitions = templatefile("${path.module}/templates/ecs-task-def.tmpl", {
    container_name        = "${var.component_name}-container"
    ecr_url               = local.task_ecr_url,
    image_name            = "deductions/${var.component_name}",
    image_tag             = var.task_image_tag,
    cpu                   = var.task_cpu,
    memory                = var.task_memory,
    container_port        = var.port,
    host_port             = var.port,
    log_region            = var.region,
    log_group             = local.task_log_group,
    environment_variables = jsonencode(local.environment_variables),
    secrets               = jsonencode(local.secret_environment_variables)
  })

  tags = {
    Environment = var.environment
    CreatedBy= var.repo_name
  }
}