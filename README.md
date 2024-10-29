---
title: How to run the site locally
---

## Setup

In terminal:

1. `npm install --global yarn`

## Run the site

1. `yarn && yarn start`
1. Open the site at `http://localhost:4000`

## Advanced

The above command should run everything, but if you need to run things separately:

1. `bundle exec jekyll serve --livereload`

    Optionally add the `--verbose` flag to see more information.

1. `yarn run watch:css` (only needed if modifying CSS)
