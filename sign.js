var crypto = require('crypto')

var EXPIRATION_SEC = 3

/*
 * Provided data gets signed with credentials
 * credentials = {
 *     "user": user,
 *     "key": key
 * }
 * Returns an object {
 *     "signedData": data_transformed_to_array,
 *     "user": user,
 *     "expire": "2016-03-28T12:56:07.278Z",
 *     "signature": signature
 * }
 */
function signData(credentials, data) {
    data = data || {}

    var signedData = []

    for (k in data) {
        if (data.hasOwnProperty(k)) {
            signedData.push({ key: k, val: data[k] })
        }
    }

    var expire = new Date()
    expire.setSeconds(expire.getSeconds() + EXPIRATION_SEC)
    expire = expire.toJSON()

    var buffStr = JSON.stringify({ user: credentials.user, expire: expire, signedData: signedData })
    policy = new Buffer(buffStr).toString('base64')
    var signature = crypto.createHmac('sha1', credentials.key).update(policy).digest('base64')

    return { signedData: signedData, user: credentials.user, expire: expire, signature: signature }
}

function validateData(credentials, data) {
    if (new Date(data.expire) < new Date()) {
        return 'Query expired: ' + data.expire + ' is less than ' + new Date().toJSON()
    }

    if (data.user !== credentials.user) {
        return 'User mismatch: "' + credentials.user + '" !== "' + data.user + '"'
    }

    var buffStr = JSON.stringify({ user: credentials.user, expire: data.expire, signedData: data.signedData })
    policy = new Buffer(buffStr).toString('base64')
    var signature = crypto.createHmac('sha1', credentials.key).update(policy).digest('base64')
    if (signature !== data.signature) {
        return 'Signature mismatch: "' + signature + '" !== "' + data.signature + '"'
    }

    return 'valid'
}

module.exports = {
    sign: signData,
    validate: validateData
}
