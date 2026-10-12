(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var result = {};
	result.user_groups = helper.getDataManagerUserGroups();
    response.setStatus(200);
    response.setBody(result);

})(request, response);
