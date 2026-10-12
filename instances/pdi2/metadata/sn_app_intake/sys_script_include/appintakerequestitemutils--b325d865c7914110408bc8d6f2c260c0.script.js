var AppIntakeRequestItemUtils = Class.create();
AppIntakeRequestItemUtils.prototype = {
    initialize: function() {
    },
	
	/**
	 * Returns the sys_id of one of the sn_pipeline_environment records of type "Development"
	 * @returns {string}
	 */
	getDefaultDevelopmentInstance: function() {
		var grEnv = new GlideRecord(AppIntakeConstants.table.SN_PIPELINE_ENVIRONMENT);
		grEnv.addQuery("instance_type", "dev");
		grEnv.setLimit(1);
		grEnv.query();
		if (grEnv.next()) {
			return grEnv.getUniqueValue();
		}
		
		return null;
	},
	

    type: 'AppIntakeRequestItemUtils'
};
