(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    let products = (new ConfigurationHubUtil()).getProductData();
    let aceConsoles = (new ConfigurationHubAceUtil()).getACEConsoles();
    let result = {
        products,
        aceConsoles
    };
    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
