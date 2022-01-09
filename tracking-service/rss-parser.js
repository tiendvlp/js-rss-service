const API_KEY = "crqz0qfs3k4uuqh1ywrh1bk5v6ojrhrclgggesov"
const API_URL = "https://api.rss2json.com/v1/api.json?rss_url="
import fetch from 'node-fetch';

export const Parser = {}
Parser.parse = async function parse(rssUrl) {
    try {
        const count = 1000
        const requestUrl = API_URL + rssUrl + "&api_key=" + API_KEY + "&count=" + count
        console.log(requestUrl)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 7000)
        let resp = await fetch(requestUrl, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (!resp.ok) {
            console.log("Parse rss feed " + rssUrl + "failed: " + resp.statusText)
            return { isSuccess: false, message: resp.statusText }
        }
        const respData = await resp.json().then(data => ({ status: resp.status, body: data, statusText: resp.statusText }))
        console.log("RssParser: fetch rss data" + rssUrl + " succesfully")
        return { isSuccess: true, data: respData.body, message: resp.statusText }
    } catch (ex) {
        return { isSuccess: false, message: "Connection timeout" }
    }
}