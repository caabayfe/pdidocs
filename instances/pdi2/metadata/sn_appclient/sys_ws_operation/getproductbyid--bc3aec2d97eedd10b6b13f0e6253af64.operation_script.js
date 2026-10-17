(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var requestParams = appManagerApiUtil.getRequestParams();
        var productInfoHelper = new ProductInfoHelper();
        var product = productInfoHelper.getProduct(requestParams);
        appManagerApiUtil.setResponseBody(product);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

})(request, response);
