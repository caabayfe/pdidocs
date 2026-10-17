(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        
        let dataToSend = new UXAHandler().handleMetadataRequest(request.body?.data);

        response.setStatus(200);
        response.setBody(dataToSend);
    } catch (ex) {
        gs.error("Error while fetching data for filters");
        gs.error(ex.stack);
        response.setStatus(500);
        response.setBody({
            'error': "Error occured while fecthing data"
        });
    }

})(request, response);
