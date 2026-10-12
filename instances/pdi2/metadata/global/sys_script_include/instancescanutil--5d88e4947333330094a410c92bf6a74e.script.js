var InstanceScanUtil = Class.create();
InstanceScanUtil.prototype = {
    initialize: function() {
    },
	
	hasTableAccess: function(tableName, accessType) {
		var gsm = GlideSecurityManager.get();
		return gsm.hasRightsTo("record/" + tableName + "/" + accessType, null);
	},

	findingHasMuteRule: function(finding) {
		return(new GlideRecord('scan_mute_rule').get(finding.scan_mute_rule));
	},
	
    type: 'InstanceScanUtil'
};
