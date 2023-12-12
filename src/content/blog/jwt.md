---
title: You are (most likely) using JWT wrong
pubDate: 12/01/2023 14:25
author: "Ggoggam"
tags:
  - JWT
  - Fullstack
imgUrl: '../../assets/jwt.svg'
description: "Caveats of JWT"
layout: '../../layouts/BlogPost.astro'
---

## Introduction
JSON Web Token (JWT) is a web standard that is being widely used in numerous web services[^1] such as OAuth 2.0 by major platforms.
For those who are not familiar, an instance of JWT is comprised of three parts, namely header, payload, and signature.
The **header** identifies the cryptographic algorithm that is used to generate the signature of the token. 
The **payload** holds a set of claims such as timestamp for issuance, expiry date, and authority of the user.
Finally, the **signature** is a string that is computed by the aforementioned signature algorithm by concatenating the base64 encoded header and payload. Hence by design, if the token has been tempered with, the signature would become invalid.

An example of JWT looks like this, where each part is encoded with base64 and demarcated by a period:
```shell
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

The header is the first part, which decodes to 
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

The payload is the second part, which decodes to 
```json
{
  "sub": "123", // user id
  "name": "John Doe", // user name
  "iat": 1600000000 // issued at
}
```

The signature is computed by 
```js
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  MY_SECRET
)
```
Pretty simple! And there are JWT libraries that will help you not worry about the details of implementing JWT generation.

## Caveats
In practice, if an attacker gets hold of a valid JWT, then they can pretty much do anything they want under the victim's authority. 
That is why many implementations try to **reduce the chance of having JWT stolen**, even when token is being transferred over a supposedly secure protocol such as HTTPS.

### Refresh Token
One of the common methods is by *giving a short expiry* on the JWT that is actually used in communicating between client and server (often called the **access token**).
In order to refresh the expired JWT, we make use of what is called the **refresh token**, which is securely stored in both client and server.

Whenever the access token expires and needs to be refreshed, a refresh request is made to the server with the refresh token. The server validates the refresh token by comparing it to the corresponding refresh token of the user stored in the server database.

If there is a valid, identical refresh token in the database, the server replaces the token with a newly generated one, then returns the new token. Otherwise, an error will be returned (presumably 401), and the user will be prompted to login again. Everything should be easy from here as long as we follow standard security measures such as encrypted storage, right?

### Race Conditions

Actually, there is one more important caveat.
The client will need to store the refresh token somewhere on the device, and the token will be accessed at some point in the future when access token is expired.
As in many modern HTTP client and frameworks, requests may be made concurrently to reduce perceived loading time.

Setting everything aside including encrypted storage, *what would happen if the client makes concurrent requests when the access token is about to expire?* 
In modern HTTP clients, we see `filter` interfaces for outgoing requests where we can implement a logic to refresh token in case the outgoing access token has expired.

Let's say we made 3 concurrent requests (`a`, `b`, `c`, where requests are made in the order of `a -> b -> c`). Each request will have to access the common local storage. When request `a` is made, the request checks the token and realizes the token has expired, so it sends a refresh request to the server, preferrably in a outgoing request filter. Meanwhile, request `b` does the same since the token has not been refreshed yet and so does `c`.

The problem here is that `a` will finish refreshing the token first and saves the token to the storage. `b`, without knowing that `a` has already replaced the token, will send the refresh request to the server **with the old token**, which will lead to 401 error and eventual logout. `c` will not even see the light of the day.
This is obviously not desirable in terms of UX, where the experience may worsen the shorter the expiry of the access token, say 5 minutes.

Therefore, it is important that there is some **mutex** (mutually exclusive) logic present in the refreshing logic to prevent other requests from accessing the common token storage while refresh is going on in one of the concurrent coroutines. 
This race condition is often overlooked when implementing client-side refresh logic.





[^1]: https://en.wikipedia.org/wiki/JSON_Web_Token