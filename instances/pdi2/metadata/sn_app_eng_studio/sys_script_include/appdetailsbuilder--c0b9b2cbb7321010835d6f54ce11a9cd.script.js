var AppDetailsBuilder = (function() {
	return {
		build: function(applicationSysId) {
			var appDetailsRecord = new GlideRecord(CreatorStudioConstants.appDetailsTable.NAME);
			var appDetails;
		
			if (!appDetailsRecord.get('application', applicationSysId)) {
				return null;
			}
			
			appDetails = this.buildDetailsBody(appDetailsRecord);
		
			return appDetails;
		},
		buildDetailsBody: function(appDetailsRecord) {
			return {
				sys_id: appDetailsRecord.getUniqueValue(),
				app_sys_id: appDetailsRecord.getValue('application'),
				operations: appDetailsRecord.getValue('operations'),
			};
		}
	};
})();
