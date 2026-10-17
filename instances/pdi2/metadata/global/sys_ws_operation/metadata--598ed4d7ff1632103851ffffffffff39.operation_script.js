(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var metadataURL = request.queryParams["metadata_url"];

    if (!metadataURL || metadataURL == '') {
        response.setBody({
            "error_msg": gs.getMessage("Metadata URL must be part of request query params"),
			"success" : false
        });
        response.setContentType("application/json");
        return;
    }

    var cimdMetadataHelper = new global.CIMDMetadataHelper();
    var result = cimdMetadataHelper.fetchCIMDMetadata(metadataURL);

    response.setBody(result);
    response.setContentType("application/json");

})(request, response);
