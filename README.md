# Policy Compass

Policy Compass is a web app that analyzes information security policy documents
(PDF) against the NIST SP 800-171 and ISO/IEC 27001 frameworks, scores their
compliance, and generates actionable remediation items. Action items can be
pushed directly to Jira as tickets.

**Live app:** https://policy-compass-parthm.web.app/

> The live app serves the frontend, Authentication, and Firestore. The
> "Analyze" and "Push to Jira" features run on Cloud Functions, which require
> Firebase's Blaze (pay-as-you-go) plan to deploy - see
> [Cloud Functions and the Blaze plan](#cloud-functions-and-the-blaze-plan).
> To use those features for free, run everything locally with the emulators
> (below).

## How it works

1. Sign up / log in (Firebase Authentication).
2. Upload a PDF policy document - text is extracted client-side with `pdf.js`.
3. The extracted text is sent to a Cloud Function (`GeminiCall`), which uses
   Google's Gemini API to score the document and generate a structured
   compliance report with action items.
4. Optionally, click "Push to Jira" to create a ticket for each action item via
   the `CreateJiraTickets` Cloud Function.

## Tech stack

- React 19 + TypeScript (Create React App)
- Firebase: Auth, Firestore, Hosting, Cloud Functions (2nd gen)
- Google Gemini API (`@google/generative-ai`)
- Jira Cloud REST API

## Prerequisites

- Node.js 18+ (Cloud Functions run on Node 22)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- A Firebase account with access to this project (or your own Firebase
  project - see [Deploying to your own project](#deploying-to-your-own-project))

## Getting started

```bash
git clone <this-repo>
cd policy-compass

# Frontend dependencies
npm install

# Cloud Functions dependencies
cd functions && npm install && cd ..
```

### Run the frontend

```bash
npm start
```

Opens the app at http://localhost:3000. By default this talks to the live
Firestore and Authentication in the `policy-compass-parthm` Firebase project,
so login/signup work immediately. The "Analyze" and "Push to Jira" features
need the Cloud Functions emulator (below) unless functions have been deployed.

### Run everything locally (Cloud Functions emulator)

This is the recommended way to test the AI analysis and Jira integration -
it's free and doesn't require the Blaze plan.

1. Copy `functions/.env.example` to `functions/.env` and fill in:
   - `GEMINI_API_KEY` - from [Google AI Studio](https://aistudio.google.com/app/apikey)
     (free tier is sufficient)
   - `JIRA_URL`, `JIRA_PROJECT_KEY`, `JIRA_EMAIL`, `JIRA_API_TOKEN` - only needed
     for the "Push to Jira" feature

2. Start the emulators:

   ```bash
   firebase emulators:start --only auth,functions,firestore
   ```

   This serves Auth, Firestore, and Functions emulators with a local UI at
   http://localhost:4000. (Drop `--only` to also start the Hosting emulator,
   if port 5000 is free on your machine.)

3. Point the frontend at the emulators by adding to `src/firebase/config.js`:

   ```js
   import { connectFunctionsEmulator } from "firebase/functions";
   import { connectFirestoreEmulator } from "firebase/firestore";
   import { connectAuthEmulator } from "firebase/auth";

   if (process.env.NODE_ENV === "development") {
     connectFunctionsEmulator(getFunctions(), "localhost", 5001);
     connectFirestoreEmulator(db, "localhost", 8080);
     connectAuthEmulator(auth, "http://localhost:9099");
   }
   ```

   then run `npm start` in another terminal.

## Deploying

```bash
firebase login
firebase deploy --only firestore,hosting
```

This deploys Hosting and Firestore rules - no billing plan required, and is
enough for login/signup and the dashboard UI to work.

### Cloud Functions and the Blaze plan

Deploying `GeminiCall` and `CreateJiraTickets` (`firebase deploy --only
functions`, or a full `firebase deploy`) requires the project to be on the
[Blaze plan](https://firebase.google.com/pricing), which means adding a
billing account. Usage for this app stays well within the free monthly quota
(2M function invocations, Gemini 2.5 Flash free tier), but Firebase requires a
card on file to enable Blaze. You can set a budget alert in the Google Cloud
console for peace of mind.

Once on Blaze, set the Cloud Function secrets (once per project):

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set JIRA_EMAIL
firebase functions:secrets:set JIRA_API_TOKEN
```

`JIRA_URL` and `JIRA_PROJECT_KEY` are read as plain environment variables from
`functions/.env.<project-id>` (or `functions/.env`) at deploy time - see the
[Firebase docs on environment configuration](https://firebase.google.com/docs/functions/config-env).

Then deploy everything:

```bash
firebase deploy
```

## Deploying to your own project

1. Create a Firebase project and enable Authentication (Email/Password) and
   Firestore (Functions are optional - see above).
2. Update `.firebaserc` with your project ID.
3. Replace the `firebaseConfig` object in `src/firebase/config.js` with your
   project's web app config (Project Settings -> General -> Your apps).
4. Run `firebase deploy --only firestore,hosting`, and optionally set up
   Functions secrets and deploy those too.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the frontend in development mode |
| `npm run build` | Build the frontend for production |
| `npm test` | Run the test suite |
| `firebase emulators:start --only auth,functions,firestore` | Run Auth/Firestore/Functions emulators locally |
| `firebase deploy --only firestore,hosting` | Deploy hosting and Firestore rules (no billing plan needed) |
| `firebase deploy` | Deploy hosting, rules, and functions (requires Blaze plan) |
