(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = {};
	var tagUtils = new SMServiceByTagsUtils();
	var requestBody = request.body;
	var requestData = requestBody.data;

	if(JSUtil.nil(requestData.tag_list) || requestData.tag_list.length == 0){
		response.setStatus(200);
		result.valid = true;
		response.setBody(result);
		return;
	}
	
	if(!tagUtils.validateTagsList(requestData.tag_list)){
		response.setStatus(200);
		result.valid = false;
		result.error_message = gs.getMessage("Invalid list of tags, please specify proper key and value.");
		response.setBody(result);
		return;
	}
	
	var included = [];
	
	for(var i=0; i<requestData.tag_list.length; i++){
		if(tagUtils.isTagIncludedInMultiTagCategory(requestData.tag_list[i].tag)){
			included.push(requestData.tag_list[i].tag);
		}
	}
	
	if(included.length > 0){
		response.setStatus(200);
		result.valid = false;
		result.error_message = gs.getMessage("The following tags are already being used: {0}. Please use a different tag.", included.join(","));
		response.setBody(result);
		return;
	}
	
	response.setStatus(200);
	result.valid = true;
	response.setBody(result);

})(request, response);
