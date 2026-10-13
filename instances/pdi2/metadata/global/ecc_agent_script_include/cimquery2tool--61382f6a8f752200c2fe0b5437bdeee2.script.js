function CIMQuery2Tool() { }

// The processing for this probe happens in the post-processor script. That script
// won't be run unless we have created an output result here.  
CIMQuery2Tool.prototype = { run: function() { probe.createOutputResult("output"); } };
