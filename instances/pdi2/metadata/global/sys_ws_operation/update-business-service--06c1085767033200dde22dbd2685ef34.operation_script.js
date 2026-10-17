(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var model = JSON.stringify(request.body.data.model);
    return (new SNC.BusinessServiceManager()).updateBusinessService(model);
})(request, response);
