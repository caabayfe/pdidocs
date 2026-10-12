(function process(request, response) {

    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var offsetVal = helper.getParamAsString('offset');
    var numRowsPerPage = helper.getParamAsString('numRows');
	var offset = parseInt(offsetVal);
    var numRows = parseInt(numRowsPerPage);

    if (isNaN(offset) || isNaN(numRows)) {
        return new sn_ws_err.BadRequestError('offset, numRows are mandatory and should be valid integers'); // TODO update error message
    }
	
    var result = {};
    result.policies = helper.getAllPolicies(offset, numRows);
	response.setStatus(200);
    response.setBody(result);

})(request, response);
