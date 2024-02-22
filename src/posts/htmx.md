---
title: Hypermedia Systems + Kotlin
description: Back to the future
author: ggoggam
date: 01/02/2024
published: true
categories:
  - HTMX
  - Kotlin
  - MVC
---

HTMX has taken the development landscape by storm recently. 
I am also taken by the simplicity it brings to the web development, where almost 90% of the web usecases do not require anything more complicated than a plain HTML and some Javascript for interactivity.
For those who are not familiar, HTMX[^1] is a JS library based on HATEOAS (Hypermedia As The Engine Of Application State)[^2] architecture where a client interacts with servers with hypermedia. This is actually similar to what was being done in web development before, with JQuery, PHP, or some MVC frameworks.

## HATEOAS

Unlike most frontend frameworks, HATEOAS architecture assumes that the client has no prior knowledge on data. 
The client and the server interact through a fixed interface shared by documentation or interface specific language.
This brings several advantanges over conventional HTML or modern frontend frameworks:

1. You do not need to worry about client-side state management since what the client shows is just a representation of data sent by the server. There is only a single source of truth: the server.

2. You can create interactivity with minimal client-side scripts with the fixed interface. You can basically create a single page application (SPA) by having the server tell the client to respond with a partial HTML and which element it should replace.

3. Productivity-wise for a team, you can have both your frontend and backend developers to work on the same code base simultaneously. 

4. The amount of code you have to write for a service reduces drastically, as evidenced by real-life port from React to HTMX[^3][^4].

## Real-time Search with HTMX
Let us consider a simple example of a real-time search, where search results are shown after some moment the user stopped typing into the search bar.
Without explicit client-side scripts, we can achieve this with simple HTML attributes using HTMX.
To begin, the server responds with the following HTML for the home endpoint:

```html
<input type="search" 
       name="search" placeholder="Search" 
       hx-post="/search" 
       hx-trigger="input changed delay:500ms, search" 
       hx-target="#search-results">

<table class="table">
    <thead>
        <tr>
        <th>Title</th>
        <th>Author</th>
        <th>ISBN</th>
        </tr>
    </thead>
    <tbody id="search-results">
    </tbody>
</table>
```

Here, a `POST` request to `/search` endpoint is invoked by `hx-post`, which is triggered either 1. 500ms after input has been changed or 2. the input is submitted and whose response replaces `tbody` with id `search-results`. The server (written with FastAPI for the example) should therefore implement two endpoints, namely `GET /` and `POST /search`.

```python
app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return """<html>
    <head>
        <script src="./htmx.js">
    </head>
    <body>
        <input type="search" 
               name="search" placeholder="Search" 
               hx-post="/search" 
               hx-trigger="input changed delay:500ms, search" 
               hx-target="#search-results">

        <table class="table">
            <thead>
                <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                </tr>
            </thead>
            <tbody id="search-results">
            </tbody>
        </table>
    </body>
    </html>
    """

@app.post("/search", response_class=HTMLResponse)
async def search(request: Request, db = Depends(get_database)):
    body = await request.body()
    searched = db.search_books(body)
    response = ""
    for book in searched:
        response += (f"<tr><td>{book.title}</td>"
                     f"<td>{book.author}</td>"
                     f"<td>{book.isbn}</td></tr>")
    return response
```
Pretty simple without having to write much code!

## Kotlin HTML DSL and HTMX

The problem arising when using HTMX is that writing HTML templates can get lengthy and not easily managable as the service becomes more complicated.
There are server side rendering template library that allows to render a part of the content within a HTML template, such as `Thymeleaf` on JVM side and `jinja2-fragments` on Python side.
While they are both great libraries to work any web frameworks and HTMX, Kotlin's new experimental library allows for easy, declarative HTML generation with domain specific language (DSL)[^5].

Kotlin's features such as extension functions and lambdas make this possible. For instance, you can do this in Kotlin:

```kotlin
// extension function for String class
fun String.transform(transform: (String) -> String): String {
    return transform(this)
}

// calling extension function with lambda
fun main() {
    val string = "Hello, World!"
    // call lambda directly if it is the last argument of the function
    val transformed = string.transform { s ->
        // format string
        "$s Hello, World again!"
    }
    println(transformed)
}
```

With this combined with the Ktor[^6] (my recent favorite web framework) routing, we can translate the server code into a more declarative and composable form. In my opinion, this is more manageable than having HTML templates in a static directory or formatted string.

```kotlin
fun FlowContent.index() = body {
    input {
        type = "search"
        name = "search"
        placeholder = "Search"

        attributes["hx-post"] = "/search"
        attributes["hx-trigger"] = "input changed delay:500ms, search" 
        attributes["hx-target"] = "#search-results"
    }

    table {
        classes = setOf("table")
        thead {
            tr { 
                th { +"Title" }
                th { +"Author" }
                th { +"ISBN" }
            }
        }
        tbody {
            id = "search-results"
        }
    }
}

data class Book(
    val title: String,
    val author: String,
    val isbn: String
)

fun FlowContent.tableRow(book: Book) = tr {
    td { +book.title }
    td { +book.author }
    td { +book.isbn }
}

fun Application.module() {
    routing {
        get("/") {
            call.responseHtml(HttpStatusCode.OK) {
                index()
            }
        }

        post("/search") {
            val body = call.receiveText()
            val books: List<Book> = database.searchBooks(body)
            call.responseHtml(HttpStatusCode.OK) {
                books.map { book ->
                    tableRow(book)
                }
            }
        }
    }
}
```

[^1]: https://htmx.org
[^2]: https://en.wikipedia.org/wiki/HATEOAS
[^3]: https://htmx.org/essays/a-real-world-react-to-htmx-port
[^4]: https://htmx.org/essays/another-real-world-react-to-htmx-port
[^5]: https://github.com/Kotlin/kotlinx.html
[^6]: https://ktor.io