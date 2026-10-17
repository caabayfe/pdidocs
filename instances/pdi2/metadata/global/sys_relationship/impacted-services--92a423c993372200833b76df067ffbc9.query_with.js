(function refineQuery(current, parent) {

    var alertsInGroup = new global.EvtMgmtAlertsInGroupAPI();
	var alertId = parent.getUniqueValue();
	
    var parentId = parent.getValue('parent');
    if (parentId) {
        alertId = parentId;
    }
	
    var allImpactedServices = alertsInGroup.getImpactedServicesForAlert(alertId);

    current.addQuery("service_sys_id", "IN", allImpactedServices);

})(current, parent);
