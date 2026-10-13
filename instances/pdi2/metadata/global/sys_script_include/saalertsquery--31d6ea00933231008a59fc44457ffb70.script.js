var SaAlertsQuery = Class.create();
SaAlertsQuery.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getQuery: function(filter, filterGroups, timestamp ,pathIds) {
		gs.log("======= pathIds: " + pathIds);
		gs.log("======= filter: " + filter);
		gs.log("======= filter groups: " + filterGroups);

	
		var im = new SNC.ImpactManager();
		var servicesAlerts = "";
		var groupsAlerts = "";
		
		if(typeof filter != 'undefined' && filter != null && pathIds!=null) {
			servicesAlerts = im.getAlertsHistoryForNsPath(filter, pathIds, timestamp);
		} else if(typeof filter != 'undefined' && filter != null) {
			servicesAlerts = im.getAlertsHistoryForBs(filter, timestamp);
		}
			
		if(typeof filterGroups != 'undefined' && filterGroups != null) {
			groupsAlerts = im.getAlertsHistoryForGroups(filterGroups, timestamp);

		}

		var sysids = servicesAlerts.concat(",",groupsAlerts);
		return sysids; 
	},

    type: 'SaAlertsQuery'
});
