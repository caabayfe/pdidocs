(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var result = helper.getDeprecationMessage();
    response.setBody(result);
    response.setStatus(200);

})(request, response);
