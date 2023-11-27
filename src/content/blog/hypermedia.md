---
title: Hypermedia Systems & HTMX
pubDate: 11/27/2023 14:25
author: "Ggoggam"
tags:
  - HTMX
  - Fullstack
imgUrl: '../../assets/hypermedia.jpg'
description: "What is a hypermedia systems?"
layout: '../../layouts/BlogPost.astro'
---
## Introduction 
[Hypermedia Systems](https://hypermedia.systems/) is not a new idea. 
It has been around web development scene for decades, before the world embraced JS frontend frameworks such as Angular and React.
While extremely popular, the aforementioned frameworks heavily rely on state management on the client-side to be even remotely useful, which makes the development cycle messy; if data is stored in the server anyway, let the server return the visual reprentation (i.e. a webpage) with the data rendered within it.

This has been making development of web applications unnecessarily complicated both in client- and server-side, requiring knowledge in both front-end and back-end frameworks to create even the simplest web applications. This is troublesome in many ways:

- First, development cost becomes a severe hinderance to creating a web application. You would need either a fullstack developer or backend, frontend developers to create a web app.

- Second, data should have a single source of truth. Current popular frameworks require data management on both server and frontend.
