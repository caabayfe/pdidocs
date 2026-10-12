var PreventOverPermissiveTracking = Class.create();
PreventOverPermissiveTracking.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	modifyOverPermissiveModuleAccessBasedOnUpgradeFromVersion: function() {
		var gr = new GlideRecord('sys_upgrade_history');
		gr.addEncodedQuery('from_version!=n/a^ORfrom_version=NULL');
		gr.addNotNullQuery("to_version");
		gr.setLimit('1');
		gr.orderByDesc('upgrade_finished');
		gr.query();
		if (gr.next()) {
			var fromVersion = gr.getValue('from_version');
			if (null === fromVersion || fromVersion.indexOf('tokyo') > -1 || fromVersion.indexOf('rome') > -1) { //zbooted new instance or patch tokyo, instance upgraded from Rome
				//check upgrade finished time > 6 months then call api.
				var upgradeFinishedTime = gr.getValue('upgrade_finished');
				if (this.isUpgradeFinishedTimeisOver6Months(upgradeFinishedTime))
					this.setDefaultModuleAccessPolicyValueToReject();
			} else if (fromVersion.indexOf('sandiego') > -1) //instance upgraded from san Diego
				this.setDefaultModuleAccessPolicyValueToReject();
		}
	},
	setDefaultModuleAccessPolicyValueToReject: function() {
		var moduleInfoJson = {"com_snc_platform_security_oauth_glideencrypter" : "8e4dffa067331010b28becccb585efc1"}; // Teams can add their pw2 submodule info here to opt-in - their module will then transition from the allow (track, permissive) policy setting to reject based on the condition specified by this script.
		var gr = new GlideRecord("sys_kmf_crypto_module");
		for (var key in moduleInfoJson) {
			if (gr.get(moduleInfoJson[key])) {
				if(gr.getValue('default_module_access_policy_value') != 'reject') {
					gr.default_module_access_policy_value = "reject";
					gr.update();
					gs.log("Default Module Access Policy Value is set to Reject for module:" + gr.getValue("short_name") + " by Over Permissive scheduled Job");
				}
			}
		}
	},
	isUpgradeFinishedTimeisOver6Months: function(upgradeFinishedTime) {
		var selectedDate = new GlideDateTime(upgradeFinishedTime);
		var nowTime = new GlideDateTime();
		var dur = new GlideDuration();
		dur = GlideDateTime.subtract(selectedDate, nowTime);
		var days = dur.getDayPart();
		if (days >= 180)
			return true;
		return false;
	},
    type: 'PreventOverPermissiveTracking'
});
