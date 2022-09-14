module "myapp_deployment" {
  source = "../../modules/firebase"

  project_id     = var.project_id
  project_name   = var.project_name
  project_region = var.project_region
  project_org_id = var.project_org_id
}
