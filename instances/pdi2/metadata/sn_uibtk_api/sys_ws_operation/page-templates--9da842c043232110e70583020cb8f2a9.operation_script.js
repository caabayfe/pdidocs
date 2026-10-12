(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
		const templateHandler = new UIBTemplate();
		const newTemplates = templateHandler.getRecordsByQuery(BuilderToolkitConstants.PAGE_TEMPLATE_QUERY);
		const legacyTemplates = templateHandler.getLegacyTemplateRecords();
        apiHelper.respondSuccesfully({newTemplates, legacyTemplates});
    });
})(request, response);
