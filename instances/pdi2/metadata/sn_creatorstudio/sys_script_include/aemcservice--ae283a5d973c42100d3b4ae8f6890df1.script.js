var AEMCService = Class.create();
AEMCService.prototype = {
    initialize: function() {
		this.urlLeft = gs.getProperty('glide.servlet.uri') + "now/aemc/record/sn_creatorstudio_new_application_task/";
		this.urlRight = "/params/views/aemc";
		this.urlRightTasks = "/selected-tab-index/1";
	},
	aemcRequestUrl: function(current) {
		const sysId = current.getValue("sys_id");
		return `${this.urlLeft}${sysId}${this.urlRight}`;
	},
	aemcTasksUrl: function(current) {
		const sysId = current.getValue("sys_id");
		return `${this.urlLeft}${sysId}${this.urlRight}${this.urlRightTasks}`;
	},
	aemcInstalled: function() {
		const storeApps = new GlideRecordSecure("sys_store_app");
		const aemcInstalled = storeApps.get("scope", "sn_aemc");
		return aemcInstalled;
	}
};
