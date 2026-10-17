var Config = Packages.com.service_now.mid.services.Config;
var MIDConfigParameter = Packages.com.snc.commons.MIDConfigParameter;

var NetflowChunkifator = Class.create();
var CHAINS_MODULE = "chains";
var SERVICES_MODULE = "services";
var SERVER_COMMS_MODULE = "serverComms";
var MAX_CHUNK_SIZE_PROPERTY = "mid.sm.netflow.max_chunk_size";
var DEFAULT_CHUNK_SIZE = 5000000;
var CHUNK_SIZE;
var probeName;

NetflowChunkifator.prototype = {	
	initialize: function() {
		CHUNK_SIZE = Config.get().getProperty(MAX_CHUNK_SIZE_PROPERTY);
		if (CHUNK_SIZE == null || typeof(CHUNK_SIZE) == "undefined") {
			ms.log("Empty CHUNK_SIZE - using default value");
			CHUNK_SIZE = DEFAULT_CHUNK_SIZE;
		}
		probeName = probe.getParameter("name");
	},
	
	chunkify: function(json) {
		if (typeof(json) == "object") {
			json = String(json);			
		}
		var len = json.length;
		ms.log("\n*************** Inside NetflowChunkifator. JSON size is " + len + ", CHUNK_SIZE=" + CHUNK_SIZE);
		if (len <= CHUNK_SIZE) {
			ms.log("Small payload, no need to chunkify");
			return json;
		}
		startPage = 1;
		startPage = this.chunkifyModule(json, CHAINS_MODULE, startPage);
		startPage = this.chunkifyModule(json, SERVER_COMMS_MODULE, startPage);
		this.chunkifyModule(json, SERVICES_MODULE, startPage);
		
		return "";
	},
	
	chunkifyModule: function(json, moduleName, startPage) {
		ms.log("Inside chunkifyModule() function: " + moduleName + " module, startPage: " + startPage);
		var jo = JSON.parse(json);
		var objects = jo[moduleName];
		ms.log("objects type = " + typeof(objects) + ", objects.length = " + objects.length);
		if (typeof(objects) == "undefined") {
			ms.log("Empty module - exiting");
			return startPage;
		}
		
		var objectsStr = JSON.stringify(objects);
		len = objectsStr.length;
		ms.log("JSON OBJECTS size is " + len + ", CHUNK_SIZE=" + CHUNK_SIZE);
		
		var chunksNumber = Math.ceil(len /  CHUNK_SIZE);
		if (objects.length < chunksNumber) { // prevent empty chunks
			chunksNumber = objects.length;
		}
		
		ms.log("chunkifying... # of chunks: " + chunksNumber);		
		var index = 0;
		var sliceLen = Math.ceil(objects.length / chunksNumber);
		ms.log("objects #: " + len + ", slice length: " + sliceLen);
		var chunks;
		probe.setParameter("payload_paged", "true");
		var name;
		var chunkStr;
		for(var i=0;i<chunksNumber && index<len;i++) {
			var chunk = objects.slice(index, index+sliceLen);
			var chunkMap = {};
				chunkMap[moduleName] = chunk;
				//ms.log("chunk #" + i + " index=" + index);
				index += sliceLen;
				chunkStr = JSON.stringify(chunkMap);
				name = probeName + ": " + moduleName + " - MultiPage " + (i+startPage) + " of " + (chunksNumber + startPage - 1);
				probe.createOutputResult(chunkStr);
				probe.setParameter("name", name);
				probe.setParameter("repeat_interval", chunksNumber);
				probe.queue();
				//ms.log("after queue(), name=" + name + ", chunkStr=" + chunkStr);
			}
			// prevent last chunk (empty chunk) with the same name
			name = probeName + ": " + "NetflowChunkifator final page";
			probe.setParameter("name", name);
			return chunksNumber + startPage;
		},
		
		type: 'NetflowChunkifator'
	};
	
