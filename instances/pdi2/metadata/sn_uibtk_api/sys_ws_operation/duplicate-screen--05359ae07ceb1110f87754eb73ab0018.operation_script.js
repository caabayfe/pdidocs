(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        // Override Field Values should be an object with new values for the screen record e.g {name: value}
        const {
            noDomain: noDomain,
            sysId
        } = request.queryParams;

        const data = request.body.data ?? {};

        const result = new Screen([], noDomain).duplicate(sysId, data);
        typeof result === 'string' ? apiHelper.respondUnsuccesfully(result) : apiHelper.respondSuccesfully(result);
    });
})(request, response);
