var AsyncDashboardUtils = Class.create();
AsyncDashboardUtils.prototype = {
    initialize: function() {
		this.utils = new global.SysTriggerUtils();
		this.permanentErrorState = "-2";
		this.parentJobSystemIds = ["ACTIVE NODES", "ALL NODES", "PRIMARY NODES"];
		this.triggerTypeStartup = "9";
    },

	// Deletes the record from sys_trigger
	deleteRecord: function(sysTriggerId) {
		this.utils.deleteRecord(sysTriggerId);
	},

	// Sets the state to 'Ready' and clears the 'Claimed By' field
	// so the job can run again on "Next Action"
	recoverRecord: function(sysTriggerId) {
		this.utils.recoverRecord(sysTriggerId);
	},

	// Clears the 'System ID' field so the job can run again on
	// "Next Action"
	recoverStuckRecord: function(sysTriggerId) {
		this.utils.recoverStuckRecord(sysTriggerId);
	},

	getStuckJobs: function() {
		var existingNodes = this.getExistingNodes();
		
		var gr = new GlideRecord("sys_trigger");
		gr.addNullQuery('parent');
		gr.addNotNullQuery('system_id');
		gr.addQuery("system_id", "NOT IN", existingNodes);
		gr.addQuery("system_id", "NOT IN", this.parentJobSystemIds);
		gr.addQuery("trigger_type", "!=", this.triggerTypeStartup);

		gr.query();
		return gr;
	},

	getPermanentErrorJobs: function() {
		var gr = new GlideRecord("sys_trigger");
		gr.addQuery("state", this.permanentErrorState);
		gr.query();
		return gr;
	},

	getTimeDelayed: function(nextAction, updatedOn) {
		var now = new GlideDateTime();

		// The next action is in the future meaning it hasn't been delayed yet
		if (nextAction.getNumericValue() > now.getNumericValue()) {
			return new GlideDuration(0);
		}

		// The next action is in the past, so the job has not run.
		// We should use whichever is greater: next_action time or last_updated
		var jobStartTime = new GlideDateTime();
		jobStartTime.setValue(Math.max(nextAction.getNumericValue(), updatedOn.getNumericValue()));

		return GlideDateTime.subtract(jobStartTime, now);
	},

	getExistingNodes: function() {
		var existingNodes = [];
		var gr = new GlideRecord("sys_cluster_state");
		gr.query();

		while (gr.next()) {
			existingNodes.push(gr.getValue("system_id"));
		}

		return existingNodes;
	},
	
    type: 'AsyncDashboardUtils'
};
