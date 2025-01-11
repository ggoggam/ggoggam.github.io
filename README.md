## NextJS Template 

This repository contains the Next JS migrated source for the personal static blog hosted in [ggoggam.github.io](https://ggoggam/github.io).

For those who are looking to build their own blog with Next JS, you are welcome to refer to this source code for developing your own.

### Development
For JS runtime, we primarily use [`bun`](https://bun.sh). 
To run the development server at `localhost:3000`, run the following:

```bash
bun run dev
```

Once done with development, build and export the static site by simply running 

```
# or equivalently `bun next build`
bun run build
```

### Deployment
The custom deployment is done via Github Actions, whose workflow is provided in `.github/workflows/deployment.yaml`. 
Although the current version does not fully support SEO and sitemap among other functionalities, we plan to support them in the near future by taking advantage of `actions/configure-pages` action. 