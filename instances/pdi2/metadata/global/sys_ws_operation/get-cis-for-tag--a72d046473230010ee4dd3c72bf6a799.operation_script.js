(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var requestBody = request.body;
	var requestData = requestBody.data; 
	var tagUtils = new SMServiceByTagsUtils();
	var cis = tagUtils.getListOfTaggedCisForTagsList(requestData.tag_list);
	if(cis && cis.indexOf(",") > 0){
		result = cis.split(",");
	} else if(cis && cis.indexOf(",") < 0 && cis.length > 0){
		result = [cis];
	} else 
		result = [];
	response.setStatus(200);
	response.setBody(result);
})(request, response);
