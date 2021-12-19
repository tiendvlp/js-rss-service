import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import firebase_admin from 'firebase-admin';
import credential from './rssfeed-firebase.js'
export const fireBase = new Firebase()
function Firebase() {
    if (typeof Firebase.instance === 'object') {
        return Firebase.instance
    }
    this.app = initializeApp({
        credential: firebase_admin.credential.cert(credential),
        projectId: 'rssfeed-42dac',
    })
    this.fireBaseAdmin = firebase_admin
    this.fireStore = getFirestore(this.app)
}
