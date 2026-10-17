(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const result = new ComponentDefinitions().getGroupComponentDefinitions();
		apiHelper.getResponse(result, BuilderToolkitConstants.ERRORS.NO_COMPONENT_DEFINITIONS);
	});

})(request, response);
