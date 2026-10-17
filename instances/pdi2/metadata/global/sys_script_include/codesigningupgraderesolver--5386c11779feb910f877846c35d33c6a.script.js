var CodeSigningUpgradeResolver = Class.create();
CodeSigningUpgradeResolver.prototype = {
	initialize: function() {
	},

	updateRecords: function() {
		// query for skipped code signing jobs
		var gr = new GlideRecord('sys_upgrade_history_log');
		gr.addQuery("plugin", "=", "com.glide.kmf.codesigning");
		gr.addQuery("file_name", "CONTAINS", "sysauto_script"); // select scheduled jobs
		gr.addQuery("disposition", "=", 4); // select only skipped records
		gr.query();

		// revert the records to base system version
		while (gr.next()) {
			new RevertUpdateVersionAjax().revertToBaseSystem(gr.sys_id);
			gs.info("Reverted record " + gr.file_name + " to base system version.");
		}
	},

	type: 'CodeSigningUpgradeResolver'
};
