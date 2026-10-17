(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var payload = request.body.data;
    var result;
    if (payload.controlCardData) {
        result = new ACEAppBuilderUtilV2().setControl(payload.controlCardData);
    }

    response.setBody({result: result});

})(request, response);
