var MajorIncidentEvtMgmtUtilsSNC = Class.create();

MajorIncidentEvtMgmtUtilsSNC.prototype = {

	initialize: function () {
	},

	//Returns comma separated sys_ids of all the related alert for the input incident
	getRelatedAlerts: function (incidentSysId) {
		if (!incidentSysId)
			return '';
		var alertGr = new GlideRecord('em_alert');
		alertGr.addQuery('incident', incidentSysId);
		alertGr.orderByDesc('sys_created_on');
		alertGr.query();
		var allAlertSysIds = [];
		while (alertGr.next() && alertGr.canRead()) {
			if (allAlertSysIds.indexOf(alertGr.getUniqueValue()) == -1) {
				var relatedAlertSysIds = global.EvtMgmtAlertUtilsSNC.prototype.getRelatedAlerts(alertGr);
				if (relatedAlertSysIds.length > 0)
					allAlertSysIds = allAlertSysIds.concat(relatedAlertSysIds);
			}
		}
		return allAlertSysIds.toString();
	},
	
	type: 'MajorIncidentEvtMgmtUtilsSNC'
};
