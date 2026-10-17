(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;
    return (new NLUInterfaceHelper()).getMappedIntents(data.modelId, data.intentIds);

})(request, response);
