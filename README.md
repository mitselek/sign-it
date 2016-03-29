# API Data Signing Proposal



`$ npm install`  
then  
`$ node_modules/nodeunit/bin/nodeunit --reporter nested test.sign.js`

Test output should be something like:
```
test.sign.js
Test 0.1 (pass)
TC 1 - Success scenarios
    Test 1.1 (pass)
TC 2 - Failure scenarios
    TC 2.1
        Test 2.1.1 - Wrong key (pass)
        Test 2.1.2 - Wrong user (pass)
Testing timeout in 2.982 seconds.
    Test 2.2 - Timing out (pass)

OK: 5 assertions (3065ms)
```


# API

- All queries are signed - no need for session.  
- Only HTTPS is accepted.  
- No additional security layers should be needed.

## Promoter Reports

### Theater Report

- POST https://api.piletilevi.ee/report/theaterReport
- Accept: application/json

> In place of this I would recommend four separate methods
> - ../report/concert
> - ../report/show
> - ../report/owner
> - ../report/promoter
>
> Behind the curtains they might utilize the same classes if it turns out beneficial, but in sake of flexibility (maybe we will need to deal with rights differently or smth. else) I would rather keep them apart.

```
{
    "signedData": [
        { "key": "concertId",     "val": "1" },
        { "key": "showId",        "val": "" },
        { "key": "ownerId",       "val": "" },
        { "key": "promoterId",    "val": "" },
        { "key": "startDate",     "val": "2016-01-08" },
        { "key": "endDate",       "val": "2016-01-18" },
        { "key": "sellStartDate", "val": "" },
        { "key": "sellEndDate",   "val": "" }
    ],
    user: 'BackOffice Server',
    expire: '2016-03-28T14:28:50.794Z',
    signature: 'Qkjo3yIxuMKS4oVgrN9XOSVw6dw='
}
```

#### Success:

- 200: Ok
- Content-Type: application/json

```
{
    "result" : [
        {
            "eventName" : "Event1",
            "generated" : "",
            "soldTickets" : "123",
            "bookedTickets" : "1",
            "freeTickets" : "10",
            "soldSumma" : "1234.56",
            "currency" : "EUR",
        },
        {
            "eventName" : "Event2",
            "generated" : "",
            "soldTickets" : "123",
            "bookedTickets" : "1",
            "freeTickets" : "10",
            "soldSumma" : "1234.56",
            "currency" : "EUR",
        }
    ],
    "count": 2,
    "timeMs": 140
}
```

#### Error 400: Bad Request:

- 401: Unauthorized
- Content-Type: application/json

```
{
    "error" : [
        {
            "code" : "400",
            "message" : "Start date is mandatory field"
        },
        {
            "code" : "400",
            "message" : "One of following should be provided: concertId|showId|ownerId|promoterId"
        }
    ],
    "timeMs": 82
}
```

#### Error 401: Unauthorized:

- 401: Unauthorized
- Content-Type: application/json

```
{
    "error" : [
        {
            "code" : "401",
            "message" : "Unauthorized"
        }
    ],
    "timeMs": 68
}
```

---

### Event Sales Report

- POST https://api.piletilevi.ee/report/event
- Accept: application/json

> There is an urgent need for new terminology. Show and Concert are almost synonyms and no wonder they get always confused even at PL and developer's offices. Even in design of BO there are places where distinction between two terms are quite unclear (i.e. define a festival in those terms).
>> **Show** - [Urban Dictionary](http://www.urbandictionary.com/define.php?term=show)  
>> a show is a mini **concert** usually consisting of small, local bands. they are usually really low key and are usually really cheap. these shows are where all the scene, broXcore and hxc kids hang out at. they usually consist of five to nine bands that are either alright or really good, but *sutimes* the bands really *sukk* but then all the kids just go chill outside
>  
>> **[Wakefield Étudiant](http://wakefieldnews.blogspot.com.ee/2008/11/concert-vs-show-vs-gig.html)**  
>> **Concert**: A concert is a rather large musical event in an open air stadium, arena, or theatre. The acts are relatively well known (in most cases), but can just as commonly be indie. Examples: Bob Dylan and Elvis Costello at the Ryan Center; Morrissey at the Orpheum; Radiohead at the Comcast Center.  
>> **Show**: A show is a smaller sized performance, marked by indie performers. These indie acts can be high profile or low -- it really doesn't make a difference; the benchmark characteristic of a show is its low capacity. Examples: No Age at the Middle East Downstairs; Psychedelic Furs at the former Avalon.  
>> **Gig**: A gig is the smallest of performances. Consisting of typically only one act, a gig can take place at a bar, a restaurant, or even at a home. Examples: Ben Tan's backyard performances

> My personal preference would be "**performance**" as piece of art and "**event**" as something where tickets, seats, audience and/or calendar gets involved.  
> It's debatable if there is a need for "**festival**" or maybe it would be useful to just define events as hierarchical entities (making easier to sell tickets to morning yoga or ticket for Day 1 (includes morning and evening yoga and art lessons in between them) or whole festival pass (including sauna party after end of last day of festival).
>
> Anyway after being in business for 15 years it's about time to sort this thing out.
```
{
    "signedData": [
        { "key": "eventId", "val": "1" }
    ],
    user: 'BackOffice Server',
    expire: '2016-03-28T14:28:50.794Z',
    signature: 'KS4oVgrN9XOSVw6dwQkjo3yIxuM='
}
```

#### Success:

- 200: Ok
- Content-Type: application/json

```
{
    "result" : [
        {
            "eventName" : "Event1",
            "organizer" : "",
        },
        "report" : {
            "online": {
                ...,
                "sum": "13232.30",
                "currency": "EUR"
            }
        },
        "issued" : [
            {
                ...
            }
        ]
    },
    "timeMs": 191
}
```

## Asynchronously

I suggest designing API to support asynchronous queries, also.
I.e. if query has responseURI defined:

```
{
    "signedData": [
        { "key": "eventId", "val": "1" }
    ],
    user: 'BackOffice Server',
    expire: '2016-03-28T14:28:50.794Z',
    signature: 'KS4oVgrN9XOSVw6dwQkjo3yIxuM=',
    responseURI: 'https://dashboard.piletilevi.ee/vabalava/event/VgrN9XOSVw6dwQkjo3VgrN9XOSVw6dwS4oVgrQkjo3'
}
```

then response should be like

- 200: Ok
- Content-Type: application/json

```
{
    "response": "Ok"
    "timeMs": 57
}
```

and when report is ready then it gets POSTed to responseURI.


## Subscriptions

Similar to **Asynchronously**, but reports will be sent to responseURI on regular basis. Could be based on agreed time interval (once a minute/second/day) or "when new data is available". Open for discussion.
