source "https://rubygems.org"

# gem "jekyll", "~> 4.3.2"

# If you're planning to deploy to GitHub Pages, use:
gem "github-pages", group: :jekyll_plugins

group :jekyll_plugins do
  # Add any Jekyll plugins here
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have Java counterparts
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby] 