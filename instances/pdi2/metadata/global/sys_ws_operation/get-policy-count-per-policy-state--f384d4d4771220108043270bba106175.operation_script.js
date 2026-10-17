(function process(request, response) {
    response.setContentType('application/json');
    var result = {};

    result.policy_count = new CMDBDataManagerHelper().getPolicyCountPerState();

    response.setStatus(200);
    response.setBody(result);
	
})(request, response);
