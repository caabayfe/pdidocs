(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var return_obj = {};

    try {
        return_obj.plugin_installation_status = new PDFtoTableOperationHelper().isPdfToTableFeatureEnable() || false;
        response.setStatus(200);
        return_obj.status = "success";
        return_obj.message = "Successfully fetched plugin status.";
    } catch (e) {
        response.setStatus(500);
        return_obj.status = "error";
        return_obj.message = "Error occured while checking plugin status.";
    }

    response.setBody(return_obj);

})(request, response);
