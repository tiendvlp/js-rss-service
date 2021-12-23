import { Parser as parser } from './rss-parser.js'
import { fireBase } from '../firebase-instance.js'
const fireStore = fireBase.fireStore
import { encrypt } from '../UrlEncrypt.js'
import fetch from 'node-fetch';
import channelReloadSerivce from './channel-reload-async-service.js'

let isStop = false

async function stopTrackingService() {
    isStop = true;
}

async function startTrackingService(outdatedDuration, sleepDuration) {
    isStop = false;
    let startTime = Date.now()
    console.log("Update every channel that is not updated in the last " + outdatedDuration / (1000 * 60) + " minutes")
    let snapShot = await fireStore.collection("RssChannels")
        .where('latestUpdate', '<=', Date.now() - outdatedDuration)
        .orderBy("latestUpdate")
        .limit(20)
        .get()
    await Promise.all(snapShot.docs.map(async(doc) => {
        let data = doc.data()
            // to prevent overlay update, we need to update the latestUpdate field first
        data.latestUpdate = Date.now()
        await fireStore.collection("RssChannels").doc(data.id).set(data)
    }))

    await Promise.all(snapShot.docs.map(async(doc) => {
        let data = doc.data()
            // let's update
        console.log("Let update ", data.title, " - ", data.rssUrl)
        await channelReloadSerivce.reload(data.rssUrl, data.title, data.id)
    }))

    let endTime = Date.now()
    let processTime = endTime - startTime
    console.log(sleepDuration / (1000 * 60) + " minutes to the next update")
    await sleep(sleepDuration)
    if (!isStop) {
        await startTrackingService()
    } else {
        console.log("The tracking service has been stopped")
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    start: startTrackingService,
    stop: stopTrackingService
}