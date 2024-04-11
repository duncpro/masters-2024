dist.zip: build/index.html build/bundle.js build/rosters.csv build/main.css
	zip -r dist.zip build/

build/bundle.js: src/main.tsx src/linkroster.ts src/masterscom.ts src/rosters.ts src/scoreroster.ts src/util.ts
	npx esbuild src/main.tsx --outfile=build/bundle.js --bundle --sourcemap

build/index.html: src/index.html
	mkdir -p build/
	cp src/index.html build/index.html

build/rosters.csv: src/rosters.csv
	mkdir -p build/
	cp src/rosters.csv build/rosters.csv

build/main.css: src/main.css
	mkdir -p build/
	cp src/main.css build/main.css

.PHONY: watch serve clean

watch:
	watchexec -w src make build/bundle.js build/index.html build/rosters.csv build/main.css

serve:
	npx http-server build/

clean:
	rm -rf build/ 
	rm -f dist.zip
