var SysTriggerUtils = Class.create();
SysTriggerUtils.prototype = {
    initialize: function() {
    },

	// Deletes the record from sys_trigger
	deleteRecord: function(sysTriggerId) {
		var gr = new GlideRecord("sys_trigger");

		if (gr.get(sysTriggerId)) {
			var jobName = gr.getValue("name");
			var deleted = gr.deleteRecord();
			if (deleted) {
				gs.log("Deleted Scheduled Job " + jobName + ". Sys ID " + sysTriggerId);
				return true;
			}
		}

		return false;
	},

	// Sets the state to 'Ready' and clears the Claimed_by field
	recoverRecord: function(sysTriggerId) {
		var gr = new GlideRecord("sys_trigger");

		if (gr.get(sysTriggerId)) {
			gr.state = 0;
			gr.claimed_by = '';
			var sysId = gr.update();

			if (sysId != null) {
				gs.log("Recovered Scheduled Job " + gr.getValue("name") + ". Sys ID " + sysId);
				return true;
			}
		}

		return false;
	},

	recoverStuckRecord: function(sysTriggerId) {
		var gr = new GlideRecord("sys_trigger");

		if (gr.get(sysTriggerId)) {
			gr.system_id = '';
			var sysId = gr.update();

			if (sysId != null) {
				gs.log("Recovered stuck Scheduled Job " + gr.getValue("name") + ". Sys ID " + sysId);
				return true;
			}
		}

		return false;
	},

    type: 'SysTriggerUtils'
};
