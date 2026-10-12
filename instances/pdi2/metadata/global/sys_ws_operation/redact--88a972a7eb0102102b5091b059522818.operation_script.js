(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var redactionData = request.body.data;
    if (!redactionData)
        return new sn_ws_err.BadRequestError("Redaction Request is not provided");
    var redactionJson = JSON.stringify(redactionData);
    var redactionAPI = new sn_pdfgeneratorutils.PDFGenerationAPI;
    var result = redactionAPI.redact(redactionJson);
    if (result.status == 'success') {
        response.setBody(result);
        response.setStatus(200);
    } else {
        response.setStatus(404);
        return new sn_ws_err.NotFoundError(result.message);
    }

})(request, response);
