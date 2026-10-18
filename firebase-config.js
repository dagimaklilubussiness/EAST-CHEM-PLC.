/* =========================================================
   EAST CHEM PLC — Firebase connection
   Paste YOUR project's config below (see README for the exact
   steps to get this from the Firebase console — it's free).
   Until you do, the site keeps working with its built-in
   sample data; admin edits just won't be visible to other
   visitors yet.
   ========================================================= */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const FIREBASE_READY = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db = null, auth = null;
if(FIREBASE_READY){
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
}
