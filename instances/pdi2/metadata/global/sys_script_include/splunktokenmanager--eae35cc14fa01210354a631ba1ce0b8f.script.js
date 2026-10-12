var SplunkTokenManager = Class.create();
SplunkTokenManager.prototype = {
    initialize: function() {
    },
	updateToken: function(params, sysId) {
		try {
			gs.info("Update Token: Starting token update.");
			if (!sysId) {
				throw new Error("Update Token: sys_id is required.");
			}
			var requiredFields = ["token", "expiration_time_millis", "token_refresh_user", "audience", "token_id"];
			var missingFields = requiredFields.filter(function(requiredField) {
				return !params.hasOwnProperty(requiredField);
			});
			if (missingFields.length > 0) {
				throw new Error("Update Token: Missing required fields: " + missingFields.join(", "));
			}
			gs.info("Update Token: All required fields are present.");
			var tokenMetadataGr = new GlideRecord("splunk_token_credentials");
			tokenMetadataGr.addQuery('sys_id', sysId);
			tokenMetadataGr.query();
			if (!tokenMetadataGr.next()) {
				throw new Error("Update Token: Unable to find record with sys_id: " + sysId);
			}
			var gdt = new GlideDateTime();
			gdt.setNumericValue(params.expiration_time_millis);
			tokenMetadataGr.setValue("expiration_time", gdt);
			tokenMetadataGr.setValue("token",params.token);
			tokenMetadataGr.setValue("token_refresh_user", params.token_refresh_user);
			tokenMetadataGr.setValue("audience", params.audience);
			tokenMetadataGr.setValue("token_id", params.token_id);
			var recordSysId = tokenMetadataGr.update();
			
			gs.info("Update Token: Token record updated successfully with sys_id: " + recordSysId);
			return recordSysId;
		} catch (e) {
			gs.error("Update Token: Error occurred - " + e.message);
			throw e;
		}
	},

    type: 'SplunkTokenManager'
};
