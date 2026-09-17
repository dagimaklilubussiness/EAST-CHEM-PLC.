/* =========================================================
   EAST CHEM PLC — Firebase connection
   Paste YOUR project's config below (see README for the exact
   steps to get this from the Firebase console — it's free).
   Until you do, the site keeps working with its built-in
   sample data; admin edits just won't be visible to other
   visitors yet.
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyA1PzhfEDcltCP9DLWlBKh5W3VscREw74A",
  authDomain: "east-chem.firebaseapp.com",
  projectId: "east-chem",
  storageBucket: "east-chem.firebasestorage.app",
  messagingSenderId: "991599187223",
  appId: "1:991599187223:web:67e9b1dbe1819ddc2dd352"
};

const FIREBASE_READY = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db = null, auth = null;
if(FIREBASE_READY){
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
}
