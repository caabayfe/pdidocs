(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    var param = request.queryParams;
    var alertSysId = (param.alertId) ? param.alertId[0] : '';
    var excludeMetrics = (param.excludeMetrics == 'true'); //optional
    var excludeCIsInGroup = (param.excludeCIsInGroup == 'true'); //optional

    if (!alertSysId) {
        exception = new sn_ws_err.ServiceError().setStatus(400);
        exception.setMessage("The paramer alertId is mandatory");
        throw exception;
    }

    var alertsInGroup = new global.EvtMgmtAlertsInGroupAPI();

    //Construct default structure
    var result = {
        metrics: {},
        alerts: [],
        cisInGroup: []
    };

    if (!excludeMetrics || !excludeCIsInGroup) {
        var relatedAlerts = alertsInGroup.getRelatedAlertsByGroup(alertSysId);

        if (!relatedAlerts || !relatedAlerts.alerts) {
            exception = new sn_ws_err.ServiceError().setStatus(400);
            exception.setMessage("Can't get the reference to the Alerts GlideRecord");
            throw exception;
        }

        result = alertsInGroup.getAlertsGroupDetails(alertSysId, relatedAlerts.alerts, excludeMetrics, excludeCIsInGroup);
    }
    
    return result;

})(request, response);
