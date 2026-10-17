var NfdumpParser = Packages.com.snc.sw.netflow.nfdump.NfdumpParser;
var Paths = Packages.java.nio.file.Paths;

var LocalNfdumpFile = Class.create();
LocalNfdumpFile.prototype = {
    initialize: function() {
    },
	
	execute: function() {
        var nfdumpParser = new NfdumpParser();
		nfdumpParser.setParameters(probe.getParameters());
        var dumpFilePath = probe.getParameter('path');
		ms.log('parsing nfdump file: ' + dumpFilePath);
        nfdumpParser.parseFile(Paths.get(dumpFilePath));
		ms.log('nfdump parsing success');
		var json = nfdumpParser.toJson();
		var chunkifator = new NetflowChunkifator();
		var lastChunk = chunkifator.chunkify(json);
        ms.log("after chunkifator.chunkify().");
        return lastChunk;
	},

    type: 'LocalNfdumpFile'
};
