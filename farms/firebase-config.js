// AquaLedger Farms (multi-farm) connection settings.
// This uses its OWN Firebase project, separate from your own farm's site at the parent folder.
//
// 1. Firebase console → (new project) → Project settings → General → Your apps → Web app → Config.
//    Paste the values below. They only identify the project; access is enforced by farms/firestore.rules.
// 2. providerEmails: the Google account(s) that run the business. Providers create client farms,
//    pause or resume them, and can open any farm for support. Keep this list in sync with
//    isProvider() in farms/firestore.rules.
//
// Until apiKey is filled in, the site shows a sample farm that isn't saved.

window.AQUALEDGER_CONFIG = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  providerEmails: ["rahulvarmavuyyuri@gmail.com"]
};
