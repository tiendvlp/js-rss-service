import { Parser as parser } from './rss-parser.js'
import { fireBase } from '../firebase-instance.js'
const fireStore = fireBase.fireStore
import { encrypt } from '../UrlEncrypt.js'
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
export default {
    reload
}

async function reload(rssUrl, channelTitle, channelId) {
    const parseResult = await parser.parse(rssUrl)
    if (parseResult.isSuccess) {
        saveFeedsToFireStore(channelId, channelTitle, parseResult.data)
    }
}

async function saveFeedsToFireStore(rssChannelId, channelTitle, rssObject) {
    let feed = rssObject.feed
    await Promise.all(rssObject.items.map(async(item) => {
        let id = encrypt(item.link)
        let imageUrl = item.thumbnail
            // null or blank
        if (imageUrl === null || imageUrl.match(/^ *$/) !== null) {
            console.log("thumbnail is missing, try to search on content")
            imageUrl = await getImageInContentFirst(item.content)
        }
        console.log(imageUrl)
        if (imageUrl === null || imageUrl.match(/^ *$/) !== null) {
            console.log("content is not contains image, try to search on feed source")
            imageUrl = await getFirstImageUrl(item.link)
            if (imageUrl && !isValidHttpUrl(imageUrl)) {
                imageUrl = null
            }
            console.log("found image: " + imageUrl + " in feed: " + item.link)
        }
        let docRef = fireStore.collection("Feeds").doc(id)
        let newDoc = {
            author: item.author,
            channelTitle: channelTitle,
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

function getPubDate(date) {
    return Date.parse(date + " UTC+0000 (+00)")
}

async function getImageInContentFirst(content) {
    let searchTarget = content.replace(/ /g, '')
    let startIndex = searchTarget.indexOf("<img")
    if (startIndex == -1) {
        return null
    }
    let endIndex = searchTarget.indexOf(">", startIndex)

    startIndex = searchTarget.indexOf("src", startIndex)
    let result = ""
    while (startIndex < endIndex) {
        startIndex = searchTarget.indexOf("src", startIndex + 1)
        if (startIndex == -1) {
            return null
        }
        let quoteIndex = startIndex + 3 + 1
        let quoteChar = searchTarget.charAt(quoteIndex)
        result = searchTarget.substring(quoteIndex + 1, searchTarget.indexOf(quoteChar, quoteIndex + 1))
        if (result.toLowerCase().startsWith("http", 0)) {
            return result
        }
    }
    return null
}

async function getFirstImageUrl(feedUrl) {
    try {
        console.log("Getting image in feed", feedUrl)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 7000)
        let resp = await fetch(feedUrl, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (!resp.ok) {
            console.log("Response is not ok for feed:", feedUrl)
            return null
        }
        const respData = await resp.text().then(data => ({ status: resp.status, body: data, statusText: resp.statusText }))
        let content = respData.body
        let root = parse(content)
        console.log("RESULT OK", feedUrl)
        let metaImg = root.querySelector(`meta[property="og:image"]`)
        console.log("Meta img is", metaImg)
        if (metaImg) {
            let imgUrl = metaImg.getAttribute('content')
            if (imgUrl) {
                return imgUrl
            }
        }
        return null
    } catch (ex) {
        return null
    }
}

async function isUrlWorking(url) {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        let resp = await fetch(url, { signal: controller.signal })
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