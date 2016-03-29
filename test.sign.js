var testCase  = require('nodeunit').testCase
var signer = require('./sign.js')

var sign = signer.sign
var validate = signer.validate

var data1 = {concertId : 1,
    showId : '',
    startDate : '2016-01-08',
    endDate : '2016-01-18',
    ownerId : '',
    promoterId : '',
    sellStartDate : '',
    sellEndDate : '',
  }
var user = 'BackOffice Server'
var key = 'secret known to both parties'
var credentials = { user:user, key:key }
var credentials_user = { user:'wrong user', key:key }
var credentials_key = { user:user, key:'wrong key' }

var signedData = sign(credentials, data1)
console.log(signedData)

module.exports = testCase({
    "Test 0.1": function(test) {
        test.ok(true)
        test.done()
    },

    "TC 1 - Success scenarios": testCase({
        "Test 1.1 - With data": function(test) {
            var validated = validate(credentials, signedData)
            test.ok(validated === 'valid')
            test.done()
        },
        "Test 1.2 - No data": function(test) {
            var signedData = sign(credentials)
            var validated = validate(credentials, signedData)
            test.ok(validated === 'valid')
            test.done()
        }
    }),

    "TC 2 - Failure scenarios": testCase({
        "TC 2.1": testCase({
            "Test 2.1.1 - Wrong key": function(test) {
                var validated = validate(credentials_key, signedData)
                test.ok(validated !== 'valid')
                test.done()
            },
            "Test 2.1.2 - Wrong user": function(test) {
                var validated = validate(credentials_user, signedData)
                test.ok(validated !== 'valid')
                test.done()
            }
        }),
        "Test 2.2 - Timing out": function(test) {
            console.log("Testing timeout in " + (new Date(signedData.expire) - new Date()) / 1000 + ' seconds.')
            setTimeout(function () {
                var validated = validate(credentials, signedData)
                test.ok(validated !== 'valid')
                test.done()
            }, new Date(signedData.expire) - new Date())
        }
    })
})
