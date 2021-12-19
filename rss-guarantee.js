import {Parser as parser} from './rss-parser.js'
import { Firebase } from '../firebase-instance.js'
const firebase = new Firebase()
const fireStore = firebase.fireStore
import {encrypt} from '../UrlEncrypt.js'
import fetch from 'node-fetch';



let snapShot = await fireStore.collection("Feeds").where("imageUrl", "==", "").get()
let notworkingImage = []
await Promise.all(snapShot.docs.map(async (item) => {
    console.log(item.data().url)
    let itemData = item.data()
    // console.log("Go to feed: " + itemData.url)
    let imageUrl = await getFirstImageUrl(itemData.url)
    itemData.imageUrl = imageUrl
    if (isValidHttpUrl(imageUrl) && isUrlWorking(imageUrl)) {
        console.log("Valid image url: " + imageUrl + " in feed: " + itemData.url)
        await fireStore.collection("Feeds").doc(item.id).set(itemData)
    } else {
        console.log("InValid image url: " + imageUrl + " in feed: " + itemData.url)
        notworkingImage.push(itemData)
    }
}))
var json = JSON.stringify({notworkingImage});
import fs from 'fs';
fs.writeFile('InvalidImageUrl.json', json, 'utf8', () => {});
// getFirstImageUrl("https://vnexpress.net/15-nam-giai-bai-toan-rut-bao-hiem-xa-hoi-mot-lan-4400093.html")


async function getFirstImageUrl (feedUrl) {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 7000)
        let resp = await fetch(feedUrl, {signal: controller.signal})
        clearTimeout(timeoutId)
        if (!resp.ok) {
            return null
        }
        const respData = await resp.text().then(data => ({ status: resp.status, body: data, statusText: resp.statusText }))
        let content = respData.body
        // remove all white space
        let searchTarget = content.replace(/ /g,'')
        let headerTagIndex = searchTarget.indexOf("</header>")
        let imageTagIndex = searchTarget.indexOf("<img", headerTagIndex)
        if (imageTagIndex == -1) {
            return null
        }
        let srcPropIndex = searchTarget.indexOf("src", imageTagIndex)

        if (srcPropIndex == -1) {
            return null
        }
        let quoteIndex = srcPropIndex+3+1
        let quoteChar = searchTarget.charAt(quoteIndex)

        return searchTarget.substring(quoteIndex + 1, searchTarget.indexOf(quoteChar, quoteIndex + 1))
    } catch (ex) {
        return null
    }
}

async function isUrlWorking (url) {
    // console.log("check url is working or not: " + url)
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        let resp = await fetch(url, {signal: controller.signal})
        return resp.isSuccess
    } catch (ex) {
        return false
    }
    
}

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// reload("https://tinhte.vn/rss", "aHR0cHM6Ly90aW5odGUudm4vcnNz")