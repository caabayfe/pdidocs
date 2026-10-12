(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    response.setContentType('application/json');
    response.setStatus(200);
    var result = {};
    var prop = gs.getProperty("sn_admin_center.admin_home.hideEntitledDashboard");
    result.shouldHideWidget = prop ? prop : false;
    response.setBody(result);
})(request, response);
