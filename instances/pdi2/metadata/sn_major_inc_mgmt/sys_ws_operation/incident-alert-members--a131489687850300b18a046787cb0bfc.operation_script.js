(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    return new global.IAMUtil().getAllIncidentAlertContacts(request.pathParams.alert_id);

})(request, response);
