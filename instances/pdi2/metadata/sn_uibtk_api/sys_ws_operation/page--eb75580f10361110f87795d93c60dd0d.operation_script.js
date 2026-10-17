(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const page = new Page(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN)
            .getUIBEditorPageObject(apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID));
        apiHelper.getResponse(page, BuilderToolkitConstants.ERRORS.NO_SCREEN_FOUND);
    });

})(request, response);
