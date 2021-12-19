const API_KEY = "crqz0qfs3k4uuqh1ywrh1bk5v6ojrhrclgggesov"
const API_URL = "https://api.rss2json.com/v1/api.json?rss_url="
import fetch from 'node-fetch';

export const Parser = {}
Parser.parse = async function parse(rssUrl) {
    const requestUrl = API_URL + rssUrl + "&api_key=" + API_KEY
    console.log(requestUrl)
    const resp = await fetch(requestUrl)
    const respData = await resp.json().then(data => ({ status: resp.status, body: data, statusText: resp.statusText }))
    if (respData.status == 200) {
        return { isSuccess: true, data: respData.body }
    } else {
        console.log("Parse rss feed failed: " + respData.body.message)
        return { isSuccess: false, message: respData.body.message }
    }
}
