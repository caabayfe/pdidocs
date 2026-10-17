// Discovery
var CiscoCliSensor = Class.create();

CiscoCliSensor.prototype = Object.extendsObject(DiscoverySensor, {
    
	init: function(prototype) {
		DiscoverySensor.prototype.init.call(this, prototype);
		this.deviceCi = null;
        this.deviceResult = null;
	},

    process: function(result) {
		//TODO: This should be moved to DiscoverySensor once we're comfortable with the idea
		var ciGr = this.getCmdbRecord();
		if (ciGr !== null) {
			this.deviceCi = new Ci(ciGr);
		} else {
			this.deviceCi = new Ci();
		}
        this.deviceResult = new CiscoCliResponse(result);
	    this.processCiscoCliObject(); // pass the ci object as well, for visibility
		this.deviceCi.write();
		this.setDefaultSave(false);
    },

    processCiscoCliObject: function() {
        throw 'Define processCiscoCliObject() before calling it.';
    },
	
	type: 'CiscoCliSensor'
	
});
