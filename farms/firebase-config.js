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
    apiKey: "AIzaSyDoTzPL8-pAyjU69z14r9iu2YgJTcztn3A",
    authDomain: "aqualedger-farms.firebaseapp.com",
    projectId: "aqualedger-farms",
    storageBucket: "aqualedger-farms.firebasestorage.app",
    messagingSenderId: "792119238032",
    appId: "1:792119238032:web:a02a2995bddde3e48a2715",
    measurementId: "G-XB7B607QWW"
  },
  providerEmails: ["rahulvarmavuyyuri@gmail.com"]
};
