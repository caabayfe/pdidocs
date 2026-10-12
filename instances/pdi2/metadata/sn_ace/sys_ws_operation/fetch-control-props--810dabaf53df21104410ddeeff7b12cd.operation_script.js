(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var payload = request.body.data;
    var result = [];
    if (payload.controlCards && payload.controlCards.length) {
        result = new ACEAppBuilderUtilV2().getControl(payload.controlCards);
    }

    response.setBody(result);

})(request, response);
