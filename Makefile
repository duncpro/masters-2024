dist.zip: build/index.html build/bundle.js build/rosters.csv
	zip -r dist.zip build/

build/bundle.js: src/main.tsx src/linkroster.ts src/masterscom.ts src/rosters.ts src/scoreroster.ts src/util.ts
	npx esbuild src/main.tsx --outfile=build/bundle.js --bundle --sourcemap

build/index.html: src/index.html
	mkdir -p build/
	cp src/index.html build/index.html

build/rosters.csv: src/rosters.csv
	mkdir -p build/
	cp src/rosters.csv build/rosters.csv

.PHONY: watch serve clean

watch:
	watchexec -w src make build/bundle.js build/index.html build/rosters.csv

serve:
	npx http-server build/

clean:
	rm -f build/index.html
	rm -f build/bundle.js
	rm -f build/rosters.csv
	rm -f dist.zip
