(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var scope = request.queryParams.scope[0];
    var isScoped = scope !== "global" && scope != "undefined";
    var result = new SNC.GlideScriptEditorAutoCompletionUtil().getAutoCompletions(isScoped);
	response.setBody({"result": result});
	response.setStatus(200);
})(request, response);
