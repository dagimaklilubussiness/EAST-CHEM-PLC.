/* =========================================================
   EAST CHEM PLC — Firebase connection
   Paste YOUR project's config below (see README for the exact
   steps to get this from the Firebase console — it's free).
   Until you do, the site keeps working with its built-in
   sample data; admin edits just won't be visible to other
   visitors yet.
   ========================================================= */

const firebaseConfig = {
 apiKey: "AIzaSyCrkR_O1OrvpqHNiZwtxxo2tdGgLuV03xE",
  authDomain: "eastchem-50ab8.firebaseapp.com",
  projectId: "eastchem-50ab8",
  storageBucket: "eastchem-50ab8.firebasestorage.app",
  messagingSenderId: "620010586153",
  appId: "1:620010586153:web:14f6302df79f300a045c38",
};

const FIREBASE_READY = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db = null, auth = null;
if(FIREBASE_READY){
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
}
