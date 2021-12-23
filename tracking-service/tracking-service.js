import { Parser as parser } from './rss-parser.js'
import { fireBase } from '../firebase-instance.js'
const fireStore = fireBase.fireStore
import { encrypt } from '../UrlEncrypt.js'
import fetch from 'node-fetch';
import channelReloadSerivce from './channel-reload-async-service.js'

const OUTDATED_RULE_DURATION = 1000 * 60 * 30
const SLEEP_DURATION = 1000 * 60 * 3

let isStop = false

async function stopTrackingService() {
    isStop = true;
}

async function startTrackingService() {
    isStop = false;
    let startTime = Date.now()
    let snapShot = await fireStore.collection("RssChannels")
        .where('latestUpdate', '<=', Date.now() - OUTDATED_RULE_DURATION)
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
    console.log(SLEEP_DURATION / (1000 * 60) + " minutes to the next update")
    await sleep(SLEEP_DURATION)
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