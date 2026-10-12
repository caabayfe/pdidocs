(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var configTypes = new MobileConfigService().getTypes();

    return configTypes;

})(request, response);
