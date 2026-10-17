var SlowStepJSManager = Class.create();

SlowStepJSManager.prototype = {

    initialize: function() {
		this.shouldRun = gs.getProperty("enable_am_slow_steps","true") === 'true';
		this.evtMgmtStepRecorderManager = new SNC.StepRecorderManager();	
    },

    type: 'SlowStepJSManager',
		 	
	setTopic: function(topic) {
 		if (!this.shouldRun)
  			return;
		this.evtMgmtStepRecorderManager.setTopic(topic);
	},
	
	startStep: function(step) {
		if (!this.shouldRun)
			return;
		this.evtMgmtStepRecorderManager.startStep(step);
	},
	
	report: function() {
		if (!this.shouldRun)
			return;
		this.evtMgmtStepRecorderManager.report();
	}
};
