import { encode, decode } from 'js-base64';

export function encrypt(url) {
    let minimizeUrl = url
    if (minimizeUrl.substring(minimizeUrl.length - 1) === '/') {
        minimizeUrl = minimizeUrl.substring(0, minimizeUrl.length - 1)
    }
    let str = encode(minimizeUrl).toString()
    str = str.replace(/\//g, '|')
    console.log("Encrypt url: " + minimizeUrl + " => " + str)
    return str
}

export function decrypt(code) {
    let target = code.replace(/\|/g, "/")
    return decode(code)
}