(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const table = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TABLE, null);
        const tableGR = new GlideRecord(table);
        apiHelper.getResponse({
            displayField: tableGR.getDisplayName()
        });
    });

})(request, response);
