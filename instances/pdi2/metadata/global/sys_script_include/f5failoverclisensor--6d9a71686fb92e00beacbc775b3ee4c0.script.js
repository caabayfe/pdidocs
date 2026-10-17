// Discovery
	var F5FailoverCliSensor = Class.create();
	
	F5FailoverCliSensor.prototype = Object.extendsObject(DiscoverySensor, {
	    
		init: function(prototype) {
			DiscoverySensor.prototype.init.call(this, prototype);
			this.deviceCi = null;
	        this.deviceVips = null;
		},
	
	    process: function(result) {
			
			var ciGr = this.getCmdbRecord();
			if (ciGr !== null) {
				this.deviceCi = new Ci(ciGr);
			} else {
				throw 'CI Cannot be null in this stage.';
			}
			
		    this.status = this.getStatus(result);
	        this.processF5Result(this.deviceCi); // pass the ci object as well, for visibility
			this.deviceCi.write();
			this.setDefaultSave(false);
	    },
	
	    processF5Result: function(deviceCi) {
	        throw 'Define processF5Result() before calling it.';
	    },
	
	    getStatus: function(result){
	        if (JSUtil.has(result.statuses)){
				var statusArr = result.statuses['status'];
				return statusArr['@value'];
				
		    }
	    	return '';
	    },
		
		type: 'F5FailoverCliSensor'
	
});
