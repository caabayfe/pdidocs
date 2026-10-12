(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    const noDomain = apiHelper.getQueryParam('noDomain');
    const experienceId = apiHelper.getQueryParam('experienceId');
    const mode = apiHelper.getQueryParam('mode');
    apiHelper.execute(function() {
        const {
            screen,
            route,
            macroponent = {},
            applicabilities,
            screenTestValues,
            templateId
        } = request.body.data;
        const result = new Page(noDomain).createPage(experienceId,
            screen,
            route,
            macroponent,
            applicabilities,
            screenTestValues,
            templateId,
            mode ? mode.toString() : mode
        );
        typeof result === 'string' ? apiHelper.respondUnsuccessfully(result) : apiHelper.respondSuccesfully(result);
    });
})(request, response);
