---
title: XPath Rules
description: Why XPath rules over other querying methods
author: ggoggam
date: 12/15/2023
published: false
categories:
  - HTML
  - XPath
---

There are several methods of selecting an element from a DOM tree, namely by its identifying attributes i.e. `id`, `name`, CSS selector, and XPath. 
Among these three the most common choice of selector is CSS selector as many modern frontend frameworks require CSS attributes complicated enough to identify a particular element.
However, CSS selectors cannot handle a more complicated use case. Even if it does, it would quickly become unreadable.

Consider the following example of a HTML document. 
```html

```