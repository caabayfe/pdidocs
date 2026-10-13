// Discovery
	var F5CliSensor = Class.create();
	
	F5CliSensor.prototype = Object.extendsObject(DiscoverySensor, {
	    
		init: function(prototype) {
			DiscoverySensor.prototype.init.call(this, prototype);
			this.deviceCi = null;
	        this.deviceVips = null;
		},
	
	    process: function(result) {
			
			//TODO: This should be moved to DiscoverySensor once we're comfortable with the idea
			var ciGr = this.getCmdbRecord();
			if (ciGr !== null) {
				this.deviceCi = new Ci(ciGr);
			} else {
				this.deviceCi = new Ci();
			}
			
		    this.deviceVips = this.getVips(result);
	        this.processF5Result(this.deviceCi); // pass the ci object as well, for visibility
			this.deviceCi.write();
			this.setDefaultSave(false);
	    },
	
	    processF5Result: function(deviceCi) {
	        throw 'Define processF5Result() before calling it.';
	    },
	
	    getVips: function(result){
	        if (JSUtil.has(result.device['vips'])){
	            if (!(result.device.vips['vip'] instanceof Array)){
	                return [result.device.vips['vip']];
	            }
	            return result.device.vips['vip'];
	    	}
	    	return [];
	    },
		
		type: 'F5CliSensor'
	
});
