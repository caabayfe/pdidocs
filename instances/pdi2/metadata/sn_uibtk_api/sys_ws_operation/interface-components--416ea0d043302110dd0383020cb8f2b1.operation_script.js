(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){		
		apiHelper.getResponse(new ComponentDefinitions().getInterfaceComponents(), BuilderToolkitConstants.ERRORS.NO_COMPONENT_DEFINITIONS);
	});

})(request, response);
