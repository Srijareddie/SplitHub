import firebase from 'firebase';

const firebaseConfig = {
apiKey: "AIzaSyBdKBNHCdEpj2A06-SiHeMQy2d1miYK-ek",
  authDomain: "money-expense-split.firebaseapp.com",
  projectId: "money-expense-split",
  storageBucket: "money-expense-split.appspot.com",
  messagingSenderId: "471628262210",
  appId: "1:471628262210:web:d48e730f9c814487ebf6db",
  measurementId: "G-CVM1NJQ0YN"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };