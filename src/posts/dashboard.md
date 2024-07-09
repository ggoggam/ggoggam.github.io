---
title: Making a simple dashboard with HTMX
description: HTMX + FastAPI
author: ggoggam
date: 06/05/2024
published: true
categories:
  - HTMX
  - FastAPI
  - Dashboard
---

As I was almost done with my academic work, I embarked on a quick side-project to create a dashboard to monitor server status in my lab.
There used be one made by a former lab member, 
but it was no longer being maintained and becoming outdated.
My main focus on the implementation was to make it 1. simple 2. maintainable  3. modestly secure and 4. look nice. The final product looks like this:

## Project setup
Since most of the lab members are only familiar with python, I decided to implement the web server with `fastapi`, a popular choice of ASGI framework. For a nice UI component, there are not that many choice for pure HTML/CSS. 
I decided to go with DaisyUI[^1], which is complete with features and has nice simple look. 
Since I am not using any JS runtime, I put a minified JS libs for HTMX, Tailwind, and DaisyUI to `static` folder.

## Dockerizing & Workflow

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
Hopefully it is put to good use by the lab members.

[^1] https://daisyui.com