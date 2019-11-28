async function main(port, lineNumber, columnNumber) {
  var stackframe = new StackFrame({
    fileName: `http://localhost:${port}/8c2052c2-11f5-11ea-a8a0-378c234bfe28-bundle.js`,
    lineNumber,
    columnNumber
  });

  var callback = function myCallback(stackframe) {
    console.log(JSON.stringify(stackframe, null, 4));
  };

  var errback = function myErrback(error) {
    console.log("stacktrace utils error: ", error.message);
    //StackTrace.fromError(error).then(enhancedErr => console.log('enhanced', enhancedErr));
  };

  var gps = new StackTraceGPS();

  // Pinpoint actual function name and source-mapped location
  await gps.pinpoint(stackframe).then(callback, errback);

  // Better location/name information from source maps
  await gps.getMappedLocation(stackframe).then(callback, errback);

  // For some reason, this doesn't complete in Puppeteer, but does in normal Chrome
  // Get function name from location information
  //await gps.findFunctionName(stackframe).then(callback, errback);

  console.log("finito");
}
