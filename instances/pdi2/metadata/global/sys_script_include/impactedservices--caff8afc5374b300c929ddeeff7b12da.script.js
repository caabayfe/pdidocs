var ImpactedServices = Class.create();
var res = "";
ImpactedServices.prototype = {
    initialize: function(input) {
		var parent = new GlideRecord("em_alert");
		parent.addQuery("number", input);
		parent.query();
		if(parent.next()) {
			var alertManager = new SNC.AlertManager();	
			var allImpactedServices = alertManager.getImpactedServiceByAlert(parent.group, parent.cmdb_ci);
			res = "sys_idIN" + [allImpactedServices];
		} else {
			gs.log("******* No Record was found for alert number =" + input + "*****");
		} 
    },
	get: function() {
		return res;
	},
    type: 'ImpactedServices'
};
