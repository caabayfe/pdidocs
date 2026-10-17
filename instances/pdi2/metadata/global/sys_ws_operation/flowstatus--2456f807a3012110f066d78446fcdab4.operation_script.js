(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var contextId = request.pathParams.contextId;;
    var flowOutputs = sn_fd.FlowAPI.getOutputs(contextId);
    if (flowOutputs.trainjson) {
        flowOutputs = JSON.parse(flowOutputs.trainjson);
    }
    return flowOutputs;
})(request, response);
