# GCF monorepo

Example repository to demonstrate how to work with Google Cloud function with monorepo.

# 🏃‍♂️ Getting started

1. Install dependencies: `yarn install`

# Local development of google cloud function

To run local function, you need to use `dev` script, for example:

```sh
yarn workspace @myapp/funny-world dev
```

Then visit `http://localhost:8080/` to see the function response.

# Local development of firebase function

To run local function, you need to use `dev` script, for example:

```sh
yarn workspace @myapp/firebase-functions dev
```

Then visit `http://localhost:5003/demo-firebase-emulator-app/us-central1/helloWorld` to see the function response.

# Deployment

Before you run `gcloud functions deploy`, you need to prepare function for deployment using:

```sh
yarn cli prepare-deploy funny-world
```

> Remember to remove the changes after deployment!
