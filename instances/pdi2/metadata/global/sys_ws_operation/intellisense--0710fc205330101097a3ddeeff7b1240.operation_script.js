(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var pathParams = request.pathParams;
    var tableName = pathParams.tableName;
	var requestBody = request.body.data;
	var sysIds = requestBody.scriptIncludes;
	
	var result = new GlideScriptEditorManager().getIntellisenseForScripts(sysIds, tableName);
    response.setBody({
        'result': result
    });
    response.setStatus(200);

})(request, response);
