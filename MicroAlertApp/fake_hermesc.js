const fs = require('fs');
const args = process.argv.slice(2);

let outPath = '';
let bundlePath = '';
let makeSourceMap = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-out') {
        outPath = args[i + 1];
        bundlePath = args[i + 2];
    }
    if (args[i] === '-output-source-map') {
        makeSourceMap = true;
    }
}

if (outPath && bundlePath) {
    console.log(`[Fake Hermesc] Bypassing compilation. Copying ${bundlePath} -> ${outPath}`);
    fs.copyFileSync(bundlePath, outPath);

    if (makeSourceMap) {
        const dummyMap = JSON.stringify({
            version: 3,
            file: bundlePath,
            sources: [],
            mappings: ""
        });
        fs.writeFileSync(outPath + ".map", dummyMap);
        console.log(`[Fake Hermesc] Created dummy source map at ${outPath}.map`);
    }

} else {
    console.error("[Fake Hermesc] Missing -out or bundle path. Arguments:", args);
    process.exit(1);
}
