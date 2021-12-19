import {Parser as parser} from './rss-parser.js'
import { Firebase } from '../firebase-instance.js'
const firebase = new Firebase()
const fireStore = firebase.fireStore
console.log(fireStore)
async function reload(rssUrl, channelId) {
    // const parseResult = await parser.parse(rssUrl)
    fireStore.doc
    // if (parseResult.isSuccess) {
        const snapshot = await fireStore.collection('RssChannels').get()
        snapshot.forEach(element => {
            console.log(element.id, '=>', JSON.stringify(element.data()))
        });
    // }
}

reload("https://www.tinhte.vn/rss")