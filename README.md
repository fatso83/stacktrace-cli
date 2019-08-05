# stacktrace-cli
> Retroactively show a source mapped location from a error message

## Example:
You have such an error in your logs: 
```
https://localhost:56962/app-bundle.js 129:600036 TypeError: Cannot read property 'map' of undefined
```

If you download then download `app-bundle.js` and `app-bundle.js.map` you can get the original 
source lines using this tool:

```
 npx @fatso83/stacktrace-cli dist/app-bundle.js* 129:600036
{
    "columnNumber": 56,
    "lineNumber": 78,
    "fileName": "webpack:///src/store/entitys/entitys-reducer.js",
    "functionName": "getEntitysById"
}
{
    "columnNumber": 56,
    "lineNumber": 78,
    "fileName": "webpack:///src/store/entitys/entitys-reducer.js",
    "functionName": "map"
}
```

## How?
- Stacktrace.js
- Node HTTP
- Puppeteer

Stacktrace.js is wonderful. In theory. When trying to use it, the docs are 
missing all the bits on how to get this running. This is my attempt at 
solving [an itch that needed scratching](https://stackoverflow.com/questions/57346131/convert-columnerror-to-original-line-numbers-using-a-source-map).

This was literally hacked together in 3 hours, so feel free to extract, refactor and package it up as the sweet little thing it could have been.
