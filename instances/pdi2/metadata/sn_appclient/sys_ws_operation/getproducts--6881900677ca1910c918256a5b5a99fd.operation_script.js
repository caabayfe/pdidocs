(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var productInfoHelper  = new ProductInfoHelper();
        var products = productInfoHelper.getProducts(appManagerApiUtil);
        appManagerApiUtil.setResponseBody(products);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
    })(request, response);
