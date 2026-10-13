function SMIStorageServer() { }

// The processing for this probe happens in the post-processor script. That script
// won't be run unless we have created an output result here.  
SMIStorageServer.prototype = { run: function() { probe.createOutputResult("output"); } };
