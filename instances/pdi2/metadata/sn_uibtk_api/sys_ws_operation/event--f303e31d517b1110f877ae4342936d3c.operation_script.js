(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID, null);
        const event = new UXEvent().getRecordById(sysId);
        apiHelper.getResponse({
            event
        });
    });

})(request, response);
