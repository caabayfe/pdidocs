(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var validationToken = request.pathParams.token;
    var instanceValidationProperty = "glide.ml.instance.validation.token";
    var value = gs.getProperty(instanceValidationProperty);
    var response_body;
    if (!gs.nil(value) && value.split(",").indexOf(validationToken) >= 0) {
        response_body = {
            result: "true"
        };
    } else {
        response_body = {
            message: "Invalid token. callback url validation failed.",
            result: "false"
        };
        gs.info("Callback URL validation failed. Validation token: " + validationToken + "validation property: " + value);
    }
    response.setStatus(200);
    response.setContentType('application/json');
    response.setBody(response_body);
})(request, response);
