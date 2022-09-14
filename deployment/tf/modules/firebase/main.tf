terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 4.31.0"
    }
    google-beta = {
      source = "hashicorp/google-beta"
      version = ">= 4.31.0"
    }
  }
}

provider "google" {
    project     = var.project_id
    region      = var.project_region
}


provider "google-beta" {
  project     = var.project_id
  region      = var.project_region
}

resource "google_project" "default" {
  provider = google-beta

  project_id = var.project_id
  name       = var.project_name
  org_id     = var.project_org_id
  skip_delete = true
}

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = google_project.default.project_id
}
