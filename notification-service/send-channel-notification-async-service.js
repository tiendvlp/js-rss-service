import { Parser as parser } from '../tracking-service/rss-parser.js'
import { fireBase } from '../firebase-instance.js'
const fireStore = fireBase.fireStore
const fireBaseAdmin = fireBase.fireBaseAdmin
import { encrypt } from '../UrlEncrypt.js'
import fetch from 'node-fetch';

export default {
    start,
    stop
}
let isStop = false;

async function start() {
    isStop = false
    let isFirstTime = true
    fireStore.collection("Feeds").onSnapshot(async(snapShot) => {
        if (isFirstTime) {
            isFirstTime = false
            return
        }
        await Promise.all(snapShot.docChanges().map(async(change) => {
            // get channel
            if (isStop) { return }
            const feed = change.doc.data()
                // console.log(JSON.stringify(feed))
            const channelDoc = await fireStore.collection("RssChannels").doc(feed.rssChannelId).get()
            const channel = channelDoc.data()
            console.log("channel " + channel.title + " has a new feed: " + feed.title)
            const notification = {
                title: channel.title,
                body: feed.title
            }
            const notificationData = {
                channelTitle: toString(channel.title),
                channelId: toString(channel.id),
                feedId: toString(feed.id.toString()),
                feedTitle: toString(feed.title),
                feedUrl: toString(feed.url),
                channelUrl: toString(channel.url),
                channelRssUrl: toString(channel.rssUrl),
                pubDate: toString(feed.pubDate)
            }
            let topic = channel.id.replace(/\|/g, "~")
            topic = channel.id.replace(/\=/g, "%")
            const message = {
                topic: topic,
                notification: notification,
                data: notificationData
            }

            console.log("Start send notification to topic: ", topic)
            fireBaseAdmin.messaging().send(message).then((response) => {
                    console.log('Successfully sent message', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
        }))
    })
}

function toString(any) {
    if (any) {
        return any.toString()
    }
    return ""
}

function stop() {
    isStop = true
}