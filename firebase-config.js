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
    apiKey: "AIzaSyAuZ5EoAD01az5nKpKQXwTt_bAMMHjQvgg",
    authDomain: "aqualedzer.firebaseapp.com",
    projectId: "aqualedzer",
    storageBucket: "aqualedzer.firebasestorage.app",
    messagingSenderId: "887982030222",
    appId: "1:887982030222:web:d40599494b28e3a91e38df",
    measurementId: "G-243TBR622X"
  },
  ownerEmails: ["rahulvarmavuyyuri@gmail.com", "rahulvarma0204@gmail.com"]
};
