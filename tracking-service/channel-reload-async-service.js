import {Parser as parser} from './rss-parser.js'
import { fireBase } from '../firebase-instance.js'
const fireStore = fireBase.fireStore
import {encrypt} from '../UrlEncrypt.js'
import fetch from 'node-fetch';

export default {
    reload
}

async function reload(rssUrl, channelId) {
    const parseResult = await parser.parse(rssUrl)
    if (parseResult.isSuccess) {
        saveFeedsToFireStore(channelId,parseResult.data)
    }
}

async function saveFeedsToFireStore (rssChannelId, rssObject) {
    let feed = rssObject.feed
    await Promise.all(rssObject.items.map(async (item) => {
        let id = encrypt(item.link)
        let imageUrl = item.thumbnail
        // null or blank
        if (imageUrl === null || imageUrl.match(/^ *$/) !== null) {
            console.log("thumbnail is missing, try to search on content")
            imageUrl = await getFirstImageUrl(item.link)
            console.log("found image: " + imageUrl + " in feed: " + item.link)
        }
        let docRef =  fireStore.collection("Feeds").doc(id)
        let newDoc = {
            author: item.author,
            channelTitle: item.title,
            content: item.content,
            description: item.description,
            id: id,
            imageUrl: imageUrl,
            pubDate: getPubDate(item.pubDate),
            rssChannelId: rssChannelId,
            title: item.title,
            latestUpdate: Date.now(),
            url: item.link
        }
        await docRef.set(newDoc)
    }))
}

function getPubDate (date) {
    console.log(Date.parse(date))
    return Date.parse(date)
}

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