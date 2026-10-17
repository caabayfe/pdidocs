(function executeRule(current, previous /*null when async*/ ) {
    var aliasSysId = current.getUniqueValue();
    var credentialSysId = getCredentialFromAliasConnection(aliasSysId);
	var createdAt;
	var difference;
	var MAX_TIME_DIFF_CREATED = 10;
    if (credentialSysId) {
        var credentialGR = new GlideRecord('oauth_2_0_credentials');
		credentialGR.get(credentialSysId);
		var oauthEntityProfile = credentialGR.getValue('oauth_entity_profile');
		if (oauthEntityProfile) {
			var oauthReqProfileGR = new GlideRecord('oauth_requestor_profile');
			oauthReqProfileGR.addQuery('requestor_id', credentialSysId);
			oauthReqProfileGR.query();
			if(oauthReqProfileGR.next()) {
				var oauthReqProfileSysId = oauthReqProfileGR.getUniqueValue();
				var oauthCredentialGR = new GlideRecord('oauth_credential');
				oauthCredentialGR.addQuery('oauth_requestor_profile', oauthReqProfileSysId);
				oauthCredentialGR.orderByDesc('sys_created_on');
				oauthCredentialGR.query();
				if(oauthCredentialGR.next()) {
					createdAt = new GlideDateTime(oauthCredentialGR.getValue('sys_created_on'));
					difference = getTimeDifferenceWithCurrentTime(createdAt);
					// max created time difference = 10 secs
					if(difference < MAX_TIME_DIFF_CREATED) {
						gs.addInfoMessage(gs.getMessage('Connection and credential are created successfully.'));
					}
				}
			}
		} else {
            credentialGR = new GlideRecord('discovery_credentials');
            credentialGR.get(credentialSysId);
			createdAt = new GlideDateTime(credentialGR.getValue('sys_created_on'));
			difference = getTimeDifferenceWithCurrentTime(createdAt);
			// max created time difference = 10 secs
			if(difference < MAX_TIME_DIFF_CREATED) {
				gs.addInfoMessage(gs.getMessage('Connection and credential are created successfully.'));
			}
		}
    }
	
	function getTimeDifferenceWithCurrentTime(startTime) {
        var currentTime = new GlideDateTime();
        var duration = GlideDateTime.subtract(startTime, currentTime);
        var differenceInSec = (duration.getNumericValue() / 1000);
		return differenceInSec;
	}
	
	function getCredentialFromAliasConnection(aliasSysId) {
        var connectionName = getConnectionFromConfigTemplate();
        if (connectionName) {
            var connectionGR = new GlideRecord('sys_connection');
            connectionGR.addQuery("connection_alias", aliasSysId);
            connectionGR.addQuery("name", connectionName);
            connectionGR.addActiveQuery();
            connectionGR.setWorkflow(false);
            connectionGR.query();
            if (connectionGR.next()) {
                return connectionGR.getValue('credential');
            }
        }
		return null;
    }
	
	function getConnectionFromConfigTemplate() {
        var templateSysId = current.configuration_template;
        var templateGR = new GlideRecord('sys_alias_templates');
        templateGR.addQuery("sys_id", templateSysId);
        templateGR.setWorkflow(false);
        templateGR.query();
        if (templateGR.next()) {
            var defaultData = templateGR.getValue('default_data_template');
            try {
                var defaultDataJSON = JSON.parse(defaultData);
                return defaultDataJSON.connection.name;
            } catch (err) {
                gs.error("Error while getting connection name from configuration");
				return null;
            }
        } else {
            gs.error("No valid configuration template found for sys_id:" + templateSysId);
			return null;
        }
    }
})(current, previous);
