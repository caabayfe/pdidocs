var ScopedServicePopulatorRunner = Class.create();
ScopedServicePopulatorRunner.prototype = {
	
	/**
	 * Accepts the following population modes:
	 * 1. SCHEDULED - typically used when running Service Populator from a scheduled job
	 * 2. RECOMPUTATION - typically used when running Service Populator during service recomputation
	 * 3. INTERACTIVE (Default Value) - typically used when running Service Populator manually (via a UI Action, background scripts etc.).
	 */
    initialize: function(mode) {
		if (!mode)
			mode = 'INTERACTIVE';
		
		this.runner = new SNC.ServicePopulatorRunner(mode);
    },
	
	run: function(serviceRecord) {
		return this.runner.run(serviceRecord);
	},

    type: 'ScopedServicePopulatorRunner'
};
