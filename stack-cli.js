#!/usr/bin/env node
/* eslint-disable no-process-exit */

const usageStr = `
USAGE: stack-cli your-bundle.js your-bundle.js.map LINE:COLUMN
`;

function usage() {
  process.stdout.write(usageStr);
  process.exit(1);
}

if (process.argv.length != 5) {
  usage();
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const { basename } = require("path");
const port = Number(process.env.PORT || 8000);
const stackutilsName = "stackutils.js";
const minifiedSource = process.argv[2];
const sourceMap = process.argv[3];
const errLocation = process.argv[4].split(":");
const errLine = errLocation[0];
const errColumn = errLocation[1];

const htmlWithModuleScript = `
<!-- source order matters -->
<script src="stackutils/source-map.js"></script>
<script src="stackutils/stackframe.js"></script>
<script src="stackutils/stacktrace-gps.js"></script>
<script src="stackutils/error-stack-parser.js"></script>
<script src="stackutils/stacktrace.js"></script>

<script>
    ${fs.readFileSync(__dirname + "/browser-script.js")}

    main(${port}, ${errLine}, ${errColumn})
</script>
`;

async function evaluatePageContent() {
  const browser = await puppeteer.launch({
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
    args: ["--no-sandbox"],
    // allow overriding chrome path
    executablePath: process.env.SINON_CHROME_BIN || null
  });
  const page = await browser.newPage();

  function die(reason) {
    if (reason) {
      /* eslint-disable no-console */
      console.error(reason);
    }

    browser.close();
    process.exit(1);
  }

  page.on("error", function(err) {
    throw err;
  });

  page.on("pageerror", function(err) {
    const errorString = err.toString();
    console.log("Page error: " + errorString);
  });

  // our "assertion framework" :)
  page.on("console", function(msg) {
    var text = msg.text();

    if (text === "finito") {
      browser.close();
      process.exit(0);
    }

    console.log(text);
  });

  await page.goto(`http://localhost:${port}`);

  setTimeout(() => die("No result within timeout."), 1000);
}

const app = http.createServer((req, res) => {
  let body, type;

  const match = req.url.match(/stackutils\/(.*)/);
  if (match) {
    body = fs.readFileSync(`${__dirname}/assets/${match[1]}`);
    type = "application/javascript";
  } else if (req.url.match(new RegExp(/bundle.js/))) {
    body = fs.readFileSync(minifiedSource);
    type = "application/javascript";
  } else if (req.url.match(new RegExp(basename(sourceMap) + "$"))) {
    body = fs.readFileSync(sourceMap);
    type = "application/octet-stream";
  } else {
    body = htmlWithModuleScript;
    type = "text/html";
  }

  const headers = {
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": type
  };
  res.writeHead(200, headers);
  res.end(body);
});

app.listen(port, evaluatePageContent);
