(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const noDomain = apiHelper.getQueryParam('noDomain');
        const mode = apiHelper.getQueryParam('mode');
        const experienceId = apiHelper.getQueryParam('experienceId');
        const {
            screen,
            macroponent = {},
            applicabilities,
            screenTestValues,
            templateId
        } = request.body.data;
        const routeRecords = new AppRoute(['fields', 'optional_parameters', 'screen_type']).getRecordsByQuery(`screen_type=${screen.screenType}`);
        if (routeRecords.length === 0) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_APP_ROUTE);
        } else {
            const result = new Screen([], noDomain).create(
                experienceId,
                screen,
                macroponent,
                [...(routeRecords[0].fields ? routeRecords[0].fields.split(',') : []), ...(routeRecords[0].optionalParameters ? routeRecords[0].optionalParameters.split(',') : [])],
                applicabilities,
                screenTestValues,
                templateId,
                mode ? mode.toString() : mode
            );
            const finalResult = {
                ...result,
                route: routeRecords[0].sysId,
				screenType: routeRecords[0].screenType
            };
            typeof result === 'string' ? apiHelper.respondUnsuccessfully(finalResult) : apiHelper.respondSuccesfully(finalResult);
        }
    });
})(request, response);
