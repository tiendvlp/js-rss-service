const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require('firebase/firestore/lite')

function Firebase() {
    if (typeof Firebase.instance === 'object') {
        return Firebase.instance
    }

    this.firebaseConfig = {
        apiKey: "AIzaSyBBSJNtnI1Fhn-Uc1IxETFMiFpN7ysNoWI",
        authDomain: "rssfeed-42dac.firebaseapp.com",
        projectId: "rssfeed-42dac",
        storageBucket: "rssfeed-42dac.appspot.com",
        messagingSenderId: "838068692530",
        appId: "1:838068692530:web:90cb71fbca0a0cd303be2b",
        measurementId: "G-DYXYG2FV59"
    };
    this.app = initializeApp(this.firebaseConfig)
    this.fireStore = getFirestore(this.app)
}

module.exports = Firebase