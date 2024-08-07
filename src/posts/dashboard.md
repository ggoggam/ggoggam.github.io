---
title: Making a simple dashboard with HTMX
description: HTMX + FastAPI
author: ggoggam
date: 06/20/2024
published: true
categories:
  - HTMX
  - FastAPI
  - Dashboard
---
As I was almost done with my academic work, I embarked on a quick side-project to create a dashboard to monitor server status in my lab.
There used be one made by a former lab member, 
but it was no longer being maintained and becoming outdated.
My main focus on the implementation was to make it 1. simple 2. maintainable  3. modestly secure and 4. look nice. The final product looks like this (some details have been redacted):

### Home (Login)
![dashboard home](./assets/home.png)

### Dashboard
![dashboard](./assets/dashboard.png)

### Dashboard with Details
![dashboard](./assets/dashboard_detail.png)

## Setup
My choice of frameworks was heavily dependent on maintainability of the project.
Since most of the lab members are already familiar with python and has no prior knowledge on popular frontend framework such as React, 
I decided to implement the web server with `fastapi`, a popular choice of ASGI framework in python.
All of the UIs are written in vanilla HTML/CSS with `jinja` templates and DasiyUI[^1] for a nice-looking component library.

I also employed HTMX for client interactivity (refer to my previous [post](/blog/htmx) for more details).
Since I am not using any JS runtime, I put a minified JS libs for HTMX, Tailwind, and DaisyUI along with stylesheets to `static` folder.
Thankfully, `fastapi` already provides an api for mounting static files, so that they can be served automatically:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
```

## Templates
The HTML templates were written with the help of `jinja2-fragments`[^2], which allows partial rendering of template by referring to the block name. 
This makes for a concise template files for easier maintenance when coupled with HTMX.
For instance, we have the `index.html` with `content` block.

```html
<!-- index.html -->
<!-- some base template to inherit from -->
{% extends "base.html" %}
{% block content %}
<div class="flex flex-col gap-y-4">
    <h1 class="text-2xl">On-Premise Server Status</h1>
    {% set running = running | default([]) %}
    {% if running | length > 0 %}
    <div class="flex flex-col gap-y-2">
        {% block on_premise_instances %}
        {% for instance in running %}
            {% with is_last = loop.last, name = instance.name %}
                {% include 'on_premise/instance.html' %}
            {% endwith %}
        {% endfor %}
        {% endblock %}
    </div>
    {% endif %}
    <div id="page-indicator" class="htmx-indicator loading loading-bars loading-lg self-center"/>
</div>
{% endblock %}
```

Depending on the routes and the type of request, we can choose to return the entire template or parts of them like so. 
Here, `/on-premise` returns the `content` block if moving from another page and the entire page if not.
The `/on-premise/instances` returns the partially rendered block upon refresh.

```python
# dependencies
# check_session: checks for valid session cookie. if session is invalid or has expired, move to login page
# is_htmx_request: check for `hx-request` header in the request
@app.get(
    "/on-premise",
    response_class=HTMLResponse,
    dependencies=[Depends(check_session), Depends(is_htmx_request)],
)
async def on_premise_page(request: Request):
    running_instances = await onpremise_service.get_server_infos(after=0, size=1)
    # load all on-premise servers in background
    return templates.TemplateResponse(
        "index.html",
        context={
            "running": running_instances,
            "request": request,
        },
        block_name="content" if request.is_htmx_request else None,
    )

...

@app.get(
    "/on-premise/instances",
    response_class=HTMLResponse,
    dependencies=[Depends(check_session)],
)
async def get_on_premise_instances(
    request: Request, after: Optional[str], size: int = 1
):
    running_instances = await onpremise_service.get_server_infos(
        after=after, size=size
    )
    return templates.TemplateResponse(
        "index.html",
        context={
            "running": running_instances,
            "request": request,
        },
        block_name="on_premise_instances",
    )
```

## Minor optimizations
I have decided to use [`paramiko`](https://www.paramiko.org/) to remotely execute commands to gather information from different servers. 
`paramiko` is a python implementation of the SSHv2 protocol, which makes it relatively safer than executing commands with `subprocess` or its alternatives.
Even though the information is gathered concurrently, execution takes time, especially when gathering the GPU information via `nvidia-smi` command.
Hence, I decided to use lazy-loading and pagination to hide the loading overhead.
Thankfully, HTMX provides this functionality via `hx-trigger`. 
We can implement a simple lazy-loading by calling paginated endpoint if the last loaded element is revealed to the user:

```html
{% if is_last %}
<div class="collapse collapse-arrow bg-base-200" hx-get="/on-premise/instances?after={{ name }}&size=5" hx-trigger="revealed" hx-swap="afterend" hx-indicator="#page-indicator">
    <input type="checkbox" name="{{ name }}"/>
    <div class="collapse-title flex flex-row items-center gap-x-4">
        {% if instance.usage == 0 %}
            {% set status = 'success' %}
        {% elif instance.usage < 50 %}
            {% set status = 'warning' %}
        {% else %}
            {% set status = 'error' %}
        {% endif %}
        <div class="badge badge-{{ status }} badge-xs"></div>
        <div class="text-2xl font-medium">
            {{ instance.name }}
        </div>
    </div>

    <div class="collapse-content overflow-x-auto">
        <div class="flex justify-end">
            <button class="btn btn-neutral btn-md" hx-get="/on-premise/instance/{{ name }}" hx-swap="innerHTML" hx-target="#{{ name }}-content" hx-indicator="#{{ name }}-indicator">
                <span id="{{ name }}-indicator" class="htmx-indicator loading loading-dots loading-sm"></span>
                Refresh
            </button>
        </div>

        <div id="{{ name }}-content" class="flex flex-col gap-y-4">
            {% include 'on_premise/instance_content.html' %}
        </div>
    </div>
</div>
{% else %}
<div class="collapse collapse-arrow bg-base-200">
    <input type="checkbox" name="{{ name }}"/>
    <div class="collapse-title flex flex-row items-center gap-x-4">
        {% if instance.usage == 0 %}
            {% set status = 'success' %}
        {% elif instance.usage < 50 %}
            {% set status = 'warning' %}
        {% else %}
            {% set status = 'error' %}
        {% endif %}
        <div class="badge badge-{{ status }} badge-xs"></div>
        <div class="text-2xl font-medium">
            {{ instance.name }}
        </div>
    </div>

    <div class="collapse-content overflow-x-auto">
        <div class="flex justify-end">
            <button class="btn btn-neutral btn-md" hx-get="/on-premise/instance/{{ name }}" hx-swap="innerHTML" hx-target="#{{ name }}-content" hx-indicator="#{{ name }}-indicator">
                <span id="{{ name }}-indicator" class="htmx-indicator loading loading-dots loading-sm"></span>
                Refresh
            </button>
        </div>

        <div id="{{ name }}-content" class="flex flex-col gap-y-4">
            {% include 'on_premise/instance_content.html' %}
        </div>
    </div>
</div>
{% endif %}
```
To further speed up the loading process, I also implemented a time-to-live cache.
Because all of service methods are implemented as `async` functions, I had to implement a wrapper for caching.
You can refer to [this post](/blog/cache-async-py) for more details.
I also implemented a quick and simple session management service so that only authorized users can access the information (our lab has a history of ).

## Dockerize & Deploy
Since the server rarely undergoes OS and software updates, I have decided to dockerize the application to ensure consistency and security. 
My favorite choice of base image for python web framework is always `slim-buster` type, which is an extremely light-weight python image built on top of `alpine` linux.

```docker
FROM python:3.10.8-slim-buster

RUN apt-get update -y

WORKDIR /code
COPY requirements.txt /code
RUN pip install --upgrade -r /code/requirements.txt

COPY src /code

# launch entry script
ENTRYPOINT [ "python", "main.py" ]
```

In addition to a nice documentation outlining the deployment process, I created a Github workflow that runs automatically upon creating a release tag.
```yaml
name: Build Docker Image and Release

on:
  push:
    tags:
      - '*.*.*'

jobs:
  build-and-release:
    runs-on: ubuntu-latest

    env:
      # bunch of secret variables

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Set dot env
        run: |
          echo "RANDOM_API_KEY=${RANDOM_API_KEY}" >> .env
          mv .env src

      - name: Build Docker image
        run: |
          docker build --platform linux/amd64 --tag dashboard:latest .

      - name: Save Docker image to file
        run: |
          docker save -o release.tar.gz dashboard:latest

      - name: Get release
        id: get_release
        uses: bruceadams/get-release@v1.3.2
        env:
          GITHUB_TOKEN: ${{ github.token }}

      - name: Upload Docker image to Release
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.get_release.outputs.upload_url }}
          asset_path: ./release.tar.gz
          asset_name: release.tar.gz
          asset_content_type: application/gzip
```

Overall, the project took less than a day to finish the basic features thanks to the simplicity that FastAPI and HTMX bring to the development. 
I had to make minor changes to make the dashboard more mobile friendly and maintainable, but otherwise the dashboard was well-received by the lab members. 
Hopefully it is put to good use.

[^1]: https://daisyui.com
[^2]: https://github.com/sponsfreixes/jinja2-fragments
