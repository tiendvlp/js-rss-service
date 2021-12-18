const rssParser = require('./rss-parser')
const Firebase = require('../firebase-instance')
const firebase = new Firebase()

async function reload(rssUrl, channelId) {
    const parseResult = await rssParser.parse(rssUrl)
    if (parseResult.isSuccess) {}
}