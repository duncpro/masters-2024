dist.zip: build/index.html build/bundle.js
	zip -r dist.zip build/

build/bundle.js: src/main.tsx
	npx esbuild src/main.tsx --outfile=build/bundle.js --bundle --sourcemap

build/index.html: src/index.html
	mkdir -p build/
	cp src/index.html build/index.html

.PHONY: watch serve clean

watch:
	watchexec -w src make build/bundle.js build/index.html

serve:
	npx http-server build/

clean:
	rm -r build/
