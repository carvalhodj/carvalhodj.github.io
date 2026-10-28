# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "retro-theme"
  spec.version       = "0.1.0"
  spec.authors       = ["Your Name"]
  spec.summary       = "A minimalist Jekyll theme for portfolios and blogs, with retro terminal details."
  spec.homepage      = "https://example.com"
  spec.license       = "MIT"

  spec.files = Dir.glob("{_layouts,_includes,_sass,assets}/**/*").select { |f| File.file?(f) } +
               %w(LICENSE README.md _data/i18n.yml)

  spec.add_runtime_dependency "jekyll", ">= 4.0", "< 5.0"
  spec.add_runtime_dependency "jekyll-feed", "~> 0.17"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.8"
end
