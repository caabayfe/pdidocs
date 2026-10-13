(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    response.setContentType('application/json');
    var param = request.queryParams;
    var alertId = param.alertId;

    if (!alertId) {
        var err = new sn_ws_err.BadRequestError(gs.getMessage("Parameter {0} is mandatory", 'alertId'));
        response.setError(err);
        return;
    }

    var result = {
        "impactedServices": []
    };

    var alertsInGroup = new global.EvtMgmtAlertsInGroupAPI();
    var allImpactedServices = alertsInGroup.getImpactedServicesForAlert(alertId);

    result.impactedServices = (allImpactedServices) ? allImpactedServices.split(',') : [];
    return result;

})(request, response);
