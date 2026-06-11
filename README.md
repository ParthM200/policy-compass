# Policy Compass

Policy Compass is a web app that analyzes information security policy documents
against the NIST SP 800-171 and ISO/IEC 27001 frameworks. Upload a policy PDF
and it scores the document's compliance, summarizes its strengths and gaps,
and generates a prioritized list of action items mapped to specific controls.
Action items can be pushed directly to Jira as tickets for tracking.

## How it works

1. Sign up / log in (Firebase Authentication).
2. Upload a PDF policy document - text, metadata, and a thumbnail are
   extracted client-side with `pdf.js`.
3. The extracted text is sent to Google's Gemini API, which scores the
   document and returns a structured compliance report: an overall score,
   compliance level, summary, and a list of action items (each with a
   priority, effort estimate, timeline, and related NIST/ISO controls).
4. Click "Push to Jira" to create a ticket for each action item via the Jira
   Cloud REST API.

## Tech stack

- React 19 + TypeScript (Create React App)
- Firebase: Authentication, Firestore, Hosting, Cloud Functions
- Google Gemini API (`@google/generative-ai`)
- Jira Cloud REST API
- `pdf.js` for client-side PDF parsing

## Running locally

```bash
git clone https://github.com/ParthM200/policy-compass.git
cd policy-compass
npm install
npm start
```

Opens the app at http://localhost:3000 with login, signup, and PDF
upload/preview working out of the box.

To run the Gemini analysis and Jira ticket creation locally too, install the
Cloud Functions dependencies and start the Firebase emulators:

```bash
cd functions && npm install && cd ..
cp functions/.env.example functions/.env
```

Fill in `functions/.env` with a [Gemini API key](https://aistudio.google.com/app/apikey)
and (optionally) Jira credentials, then run:

```bash
firebase emulators:start --only auth,functions,firestore
```

and connect the frontend to the emulators in `src/firebase/config.js`:

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

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the frontend in development mode |
| `npm run build` | Build the frontend for production |
| `npm test` | Run the test suite |
| `firebase emulators:start --only auth,functions,firestore` | Run Auth/Firestore/Functions emulators locally |
