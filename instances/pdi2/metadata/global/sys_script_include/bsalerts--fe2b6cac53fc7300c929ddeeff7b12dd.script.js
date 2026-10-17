var BsAlerts = Class.create();
var res = "";
BsAlerts.prototype = {
    initialize: function(input) {
		var parent = new GlideRecord("cmdb_ci_service_auto");
		parent.addQuery("sys_id", input);
		parent.query();
		if(parent.next()) {
			var alertManager = new SNC.AlertManager();
			var allAlertsSysIds = alertManager.getAllAlertsForBs(input);
			res = "sys_idIN" + [allAlertsSysIds];
		} else {
			gs.log("******* No Record was found for sys_id=" + input + "*****");
		} 		
    },
	get: function() {
		return res;	
	},

    type: 'BsAlerts'
};
