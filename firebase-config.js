// AquaLedger connection settings.
//
// 1. Firebase console → Project settings → General → "Your apps" → Web app → SDK setup and configuration → Config.
//    Paste the values below. These keys only identify your project; they are safe to publish.
//    Who can read and write records is enforced by firestore.rules, not by hiding these keys.
//
// 2. ownerEmails: the Google account(s) that own the farm. Owners always have full access and
//    can add staff from Settings → Team access. Use the same emails in firestore.rules.
//
// Until the apiKey below is filled in, the app runs as a sample farm that isn't saved.

window.AQUALEDGER_CONFIG = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  ownerEmails: ["owner@example.com"]
};
