# vGHC-cloudbuild-demo

This is a sample code repository for the hands-on Build/Test/Deploy with Cloud Build workshop at vGHC 2020 Open Source Day.

## Setup 

1. [Create a new project on Google Cloud Platform](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
1. Open up the Cloud Shell and fork/clone this repository.
1. Enable the following APIs
    - [Cloud Build](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)
    - [Cloud Run](https://console.cloud.google.com/apis/library/run.googleapis.com)
    - [Cloud Storage](https://console.cloud.google.com/apis/library/storage-component.googleapis.com)
1. In the Cloud Shell, copy/paste these three commands to give Cloud Build permission to deploy to Cloud Run
    ```bash
    PROJECT_ID=$(gcloud config list --format='value(core.project)')
    PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
    ```

    ```bash
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
        --role=roles/run.admin
    ```

    ```bash
    gcloud iam service-accounts add-iam-policy-binding \
        $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
        --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
        --role=roles/iam.serviceAccountUser
    ```
1. [Create a new storage bucket](https://console.cloud.google.com/storage/browser?). (Recommended: Give your bucket the same name as your project)

## Manually running a build

In the Cloud Shell, run 
```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_PROJECT_ID=<your-project-id>,_BUCKET_NAME=<your-bucket-name>
```