(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const {
            body: {
                data
            }
        } = request;
        const result = new ComponentBuilderMetadata().updateComponent(data);
        apiHelper.respondSuccesfully(result);
    });

})(request, response);
