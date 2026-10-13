var CMPMutex = Class.create();
CMPMutex.prototype = {
    initialize: function(name, spinWait, maxSpins) {
		this.mutex = new GlideSelfCleaningMutex(name, 'CMPMutex');
		this.mutex.setMaxSpins(maxSpins);
		this.mutex.setSpinWait(spinWait);
    },
	
	get: function() {
		return this.mutex.get();
	},
	
	release: function() {
		this.mutex.release();
	},

    type: 'CMPMutex'
};
