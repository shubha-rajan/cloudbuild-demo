# vGHC-cloudbuild-demo

This is a sample code repository for the hands-on Build/Test/Deploy with Cloud Build workshop at vGHC 2020 Open Source Day.

## Setup 

1. [Create a new project on Google Cloud Platform](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
1. Open up the Cloud Shell and fork/clone this repository.
    - The Cloud Shell icon can be found in the top right corner of the screen and looks like this: 

        ![Cloudshell Icon](/screenshots/cloudshell.png)
    - Once the Cloud Shell is open, be sure to run `gcloud config set project <your-project-id>`. You should see your project name show up in the bash prompt like this:
    ![Cloudshell Prompt](/screenshots/cloudshell-prompt.png)
    - If you run into issues, make sure you are using the correct Project ID. Your project ID can be found on the home page of the Cloud Console:
    
        ![Project Info](/screenshots/project-info.png)

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
1. [Create a new Cloud Storage bucket](https://console.cloud.google.com/storage/browser?). (Recommended: Give your bucket the same name as your project). This is where we will deploy our static frontend for the demo.

![Create Storage Bucket](/screenshots/create-storage-bucket.png)

- Make the storage bucket publicly accessible
    
    - Click on the "Permissions" tab
    
    ![Bucket Permissions](/screenshots/bucket-permissions.png)
        
    - Click on "Add"
    
    ![Add Permissions](/screenshots/add-permissions.png)
        
    - Give `Storage Object Viewer` permissions to `allUsers`
    
    ![Bucket Permissions 2](/screenshots/bucket-permissions2.png)

## Manually running a build
1. You'll notice in [cloudbuild.yaml](/cloudbuild.yaml) that one of our build steps (to run the tests for the backend) is commented out. We want to make sure this step runs after we build our container but before we deploy it. 
     - Uncomment that build step and add a wait_for step so that it waits for the build:
     ```yaml
       # Use the container image to run tests
        - name: 'gcr.io/cloud-builders/docker'
          entrypoint: 'bash'
          args: ['-c', 'docker run gcr.io/${_PROJECT_ID}/cloudcatsapi pytest -v']
          wait_for: ['docker-build'] # Added this line
     ```
     - Next, let's make sure the next step, `gcr-push`, waits for this one to complete:
    ```yaml
       # Use the container image to run tests
        - id: run-tests # Added this line
          name: 'gcr.io/cloud-builders/docker'
          entrypoint: 'bash'
          args: ['-c', 'docker run gcr.io/${_PROJECT_ID}/cloudcatsapi pytest -v']
          wait_for: ['docker-build'] 
        
          # Push the container image to Container Registry
        - id: gcr-push
          name: 'gcr.io/cloud-builders/docker'
          dir: 'api'
          args: ['push', 'gcr.io/${_PROJECT_ID}/cloudcatsapi']
          wait_for: ['run-tests'] # Changed this line
     ```


1. In the Cloud Shell, run 
```bash
gcloud builds submit --config cloudbuild.yaml \
	--substitutions _BUCKET_NAME=your-bucket-name,_PROJECT_ID=your-project-id

```

- replace `your-project-id` with the Project ID found on the Cloud Console home page, and `your-bucket-name` with the name you gave your bucket

2. Your build logs will appear in your terminal. You can also monitor the build from the Cloud Console. When viewing your logs through the web UI, you can filter the logs by build step:
![Build Logs](/screenshots/build-logs.png)

## Setting up a Build Trigger
1. Install the [Cloud Build Github App](https://github.com/marketplace/google-cloud-build)

1. Connect your Github Repository
    - In the Cloud Console, navigate to Cloud Build > Triggers. Then click “Connect Repository”
    
    <img src="/screenshots/create-trigger.png" width="30%" /> 
    <img src="/screenshots/create-trigger2.png" width="60%" /> 
    
    - Select GitHub as your source. You should be prompted to sign in to GitHub to authorize Cloud Build.
    
    <img src="/screenshots/create-trigger3.png" width="60%" /> 
    <img src="/screenshots/create-trigger4.png" width="30%" /> 
    
    - Give Cloud Build access to your repository.
    
    <img src="/screenshots/create-trigger6.png" width="45%" /> 
    <img src="/screenshots/create-trigger5.png" width="45%" /> 
    
2. Configure settings for the GitHub Trigger
    - Name the trigger, give it a description, and specify that it’s activated by pushing to the main branch
    
    <img src="/screenshots/configure-trigger.png" width="50%" />
    
    - You can tell Cloud Build which specific files to look for changes in to trigger a build. Here, we’re telling Cloud Build to ignore .gitignore and our Markdown files.
    
    ![Configure Trigger](/screenshots/configure-trigger2.png)
    
    - You can also specify the substitution variables that we previously passed in through the command line
    ![Configure Trigger](/screenshots/configure-trigger3.png)

## Testing the Build Trigger

1. We're going to connect the website with the backend API, merge those new changes to the master branch, and trigger a new build.
    - Navigate to [frontend/src/js/gallery.js](frontend/src/js/gallery.js). You should see some commented out code. Let's uncomment it.
    ```javascript
    const axios = require('axios').default;
    const catApi = 'http://localhost:5000';


    $(document).ready(function () {
         let htmlString = '';
         for (let i = 0; i < 10; i++) {
            axios.get(`${catApi}/cat`).then((resp) => {
                 htmlString += `<a href="${resp.data}" data-lightbox="cat-img"><img src=${resp.data}</a>`;
                 $('.gallery').html(htmlString);
             })
         }
     });

    ```
    - Next, let's change the URL at the top to point to the deployed API instead of localhost. We can find the URL for the API in the Cloud Build logs.
    ![Build Logs](/screenshots/build-logs2.png)
    - Copy this URL into the file you're editing:
    ```javascript
    const axios = require('axios').default;
    const catApi = "https://cloudcatsapi-k3dzw45ylq-uc.a.run.app"; #Changed this line
    ```
    - Now merge those changes into the master branch and watch the build complete!
