var IncrementalOfflineUtils = Class.create();
IncrementalOfflineUtils.prototype = {
    initialize: function() {
    },
	
	isInExclusionTable: function(screenId) {
		var gr = new GlideRecord("sys_sg_incremental_offline_exclusion_list");
		if (!gr.isValid())
			return;

		gr.addQuery("table", "sys_sg_screen");
		gr.addQuery("record", screenId);
		gr.query();
		if (gr.next())
			return true;

		return false;
	},
	
	addToExclusionTable: function(screenId) {
		var gr = new GlideRecord("sys_sg_incremental_offline_exclusion_list");
		if (!gr.isValid())
			return;

		gr.initialize();
		gr.setValue("table", "sys_sg_screen");
		gr.setValue("record", screenId);
		gr.insert();
	},
	
	removeFromExclusionTable: function(screenId) {
		var gr = new GlideRecord("sys_sg_incremental_offline_exclusion_list");
		if (!gr.isValid())
			return;

		gr.addQuery("table", "sys_sg_screen");
		gr.addQuery("record", screenId);
		gr.query();
		gr.deleteMultiple();
	},

    type: 'IncrementalOfflineUtils'
};
