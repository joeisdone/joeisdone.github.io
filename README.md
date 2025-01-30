---
title: How to run the site locally
---

## Prerequisites

1. Install Ruby (recommended version 3.1.x)
   - On macOS with rbenv: `rbenv install 3.1.4`
   - Set it as your local version: `rbenv local 3.1.4`

2. Install Jekyll and Bundler
   ```bash
   gem install jekyll bundler
   ```

3. Install Node.js and yarn
   ```bash
   npm install --global yarn
   ```

## Setup

1. Install project dependencies:
   ```bash
   bundle install    # Install Ruby dependencies
   yarn install     # Install Node.js dependencies
   ```

## Run the site

1. `yarn start`
2. Open the site at `http://localhost:4000`

## Advanced

The above command runs everything, but if you need to run things separately:

1. `bundle exec jekyll serve --livereload`

    Optionally add the `--verbose` flag to see more information.

2. `yarn run watch:css` (only needed if modifying CSS)

## Troubleshooting

If you see "jekyll: command not found", make sure you:
1. Have Ruby installed and selected the correct version with rbenv
2. Have run `gem install jekyll bundler`
3. Have run `bundle install`

If you're having dependency issues, try these steps:
1. Install Ruby 3.1.4: `rbenv install 3.1.4`
2. Switch to Ruby 3.1.4: `rbenv local 3.1.4`
3. Install latest compatible bundler: `gem install bundler`
4. Reinstall dependencies: `bundle install`
