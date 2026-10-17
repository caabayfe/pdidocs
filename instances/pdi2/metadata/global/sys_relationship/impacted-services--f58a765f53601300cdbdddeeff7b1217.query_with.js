(function refineQuery(current, parent) {

    var alertsInGroup = new global.EvtMgmtAlertsInGroupAPI();
    var allImpactedServices = alertsInGroup.getImpactedServicesForAlert(parent.sys_id);

    current.addQuery("sys_id", "IN", allImpactedServices);

})(current, parent);
