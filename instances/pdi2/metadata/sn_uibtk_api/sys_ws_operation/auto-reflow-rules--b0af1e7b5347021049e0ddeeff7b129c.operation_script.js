(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const autoReflowRules = new AutoReflowRule(null).getRecordsByQuery();
		apiHelper.getResponse(autoReflowRules);
	});

})(request, response);
