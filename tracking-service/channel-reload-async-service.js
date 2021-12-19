import {Parser as parser} from './rss-parser.js'
import { Firebase } from '../firebase-instance.js'
const firebase = new Firebase()

async function reload(rssUrl, channelId) {
    const parseResult = await parser.parse(rssUrl)
    if (parseResult.isSuccess) {
        console.log(parseResult.data)
    }
}

reload("https://www.tinhte.vn/rss")