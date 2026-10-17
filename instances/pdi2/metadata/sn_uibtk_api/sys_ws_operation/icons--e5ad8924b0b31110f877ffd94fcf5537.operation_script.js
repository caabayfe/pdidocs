(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const icons = new Icon().getRecordsByQuery('','name');
		apiHelper.getResponse(icons, BuilderToolkitConstants.ERRORS.NO_ICONS_FOUND);
	});

})(request, response);
