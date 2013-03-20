build: template.js index.js components
	@component build --dev

components: component.json
	@component install --dev

template.js: template.html
	@component convert $<

.PHONY: build
