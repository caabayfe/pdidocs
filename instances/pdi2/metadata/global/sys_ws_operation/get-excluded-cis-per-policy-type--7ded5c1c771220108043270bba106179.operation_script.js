(function process(request, response) {

    response.setContentType('application/json');
    var result = {};

    result.excluded_cis = new CMDBDataManagerHelper().getExcludedCisPerPolicyType();

    response.setStatus(200);
    response.setBody(result);
	
})(request, response);
