(function process(request, response) {

    response.setContentType('application/json');
	var result = {};
    var helper = new CMDBDataManagerHelper();
    var policyId = helper.getParamAsString('policy_id');
    var encodedQuery = helper.getParamAsString('encoded_query');
	var table = helper.getParamAsString('table') || 'cmdb_ci';
	
    if (JSUtil.nil(policyId)) {
        return new sn_ws_err.BadRequestError('Missing policy id');
    }

    result = helper.getPreviewMetadata(policyId, encodedQuery, table);
	if (result.error) {
		return new sn_ws_err.ServiceError(result.error);
	}
    response.setStatus(200);
    response.setBody(result);

})(request, response);
