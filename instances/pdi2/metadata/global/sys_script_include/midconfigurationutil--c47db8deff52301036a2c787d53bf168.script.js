var MIDConfigurationUtil = Class.create();

MIDConfigurationUtil.prototype = {
	
    initialize: function() {
    },

	configure: function(profileID, midSysID) {
		this._setCapabilities(profileID, midSysID);
		this._setApplications(profileID, midSysID);
		this._setClusters(profileID, midSysID);
		this._setIPRanges(profileID, midSysID);
		this._setConfigParams(profileID, midSysID);
		this._setProperties(profileID, midSysID);
	},
	
	_setCapabilities: function(profileID, midSysID) {
		var sourceTable = "mid_profile_capability_m2m";
		var destTable = "ecc_agent_capability_m2m";
		var fieldName = "capability";
		this._setProfileM2MValues(profileID, midSysID, sourceTable, destTable, fieldName, false);
	},
	
	_setApplications: function(profileID, midSysID) {
		var sourceTable = "mid_profile_application_m2m";
		var destTable = "ecc_agent_application_m2m";
		var fieldName = "application";
		this._setProfileM2MValues(profileID, midSysID, sourceTable, destTable, fieldName, true);
	},
	
	_setClusters: function(profileID, midSysID) {
		var sourceTable = "mid_profile_cluster_m2m";
		var destTable = "ecc_agent_cluster_member_m2m";
		var fieldName = "cluster";
		this._setProfileM2MValues(profileID, midSysID, sourceTable, destTable, fieldName, true);
	},
	
	_setIPRanges: function(profileID, midSysID) {
		var sourceTable = "mid_profile_ip_range_m2m";
		var destTable = "ecc_agent_ip_range_m2m";
		var fieldName = "ip_range";
		this._setProfileM2MValues(profileID, midSysID, sourceTable, destTable, fieldName, false);
	},
	
	_setConfigParams: function(profileID, midSysID) {
		var sourceTable = "mid_profile_config";
		var destTable = "ecc_agent_config";
		var sourceFieldName = "name";
		var destFieldName = "param_name";
		this._setProfileValues(profileID, midSysID, sourceTable, destTable, sourceFieldName, destFieldName, false);
	},
	
	_setProperties: function(profileID, midSysID) {
		var sourceTable = "mid_profile_property";
		var destTable = "ecc_agent_property";
		var sourceFieldName = destFieldName = "name";
		this._setProfileValues(profileID, midSysID, sourceTable, destTable, sourceFieldName, destFieldName, false);
	},
	
	_setProfileValues: function(profileID, midSysID, sourceTable, destTable, sourceFieldName, destFieldName, executeBRs) {
		var sourceGR = new GlideRecord(sourceTable);
		sourceGR.addQuery("profile", profileID);
		sourceGR.query();
		var destGR = new GlideRecord(destTable);
		while (sourceGR.next()) {
			
			if (this._isIgnoredParam(sourceGR.getValue(sourceFieldName))) {
				continue;
			}
			
			destGR.addQuery('ecc_agent', midSysID);
			destGR.addQuery(destFieldName, sourceGR.getValue(sourceFieldName));
			destGR.query();
			
			if (destGR.next()) {
				if (destGR.getValue("value") != sourceGR.getValue("value")) {
					destGR.setValue("value", sourceGR.getValue("value"));
					destGR.update();
				}
			} else {
				destGR.initialize();
				destGR.setWorkflow(executeBRs);
				destGR.setValue("ecc_agent", midSysID);
				destGR.setValue(destFieldName, sourceGR.getValue(sourceFieldName));
				destGR.setValue("value", sourceGR.getValue("value"));
				destGR.insert();
			}
		}
	},
	
	_setProfileM2MValues: function(profileID, midSysID, sourceTable, destTable, fieldName, executeBRs) {
		var sourceGR = new GlideRecord(sourceTable);
		sourceGR.addQuery("profile", profileID);
		sourceGR.query();
		while (sourceGR.next()) {
                        var destGR = new GlideRecord(destTable);
			destGR.addQuery("agent", midSysID);
			destGR.addQuery(fieldName, sourceGR.getValue(fieldName));
			destGR.query();
			
			// These M2M records only have the two fields already queried, so nothing to update
			if (destGR.hasNext())
				continue;
			
			destGR.initialize();
			destGR.setWorkflow(executeBRs);
			destGR.setValue("agent", midSysID);
			destGR.setValue(fieldName, sourceGR.getValue(fieldName));
			destGR.insert();
		}
	},
	
	_isIgnoredParam: function(name) {
		var IGNORED_PARAMS = ["mid.buildstamp", "mid_sys_id", "keypairs.mid_id", "home_dir", "url"];
		return IGNORED_PARAMS.indexOf(name) != -1;
	},
	
    type: 'MIDConfigurationUtil'
};
