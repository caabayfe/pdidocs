(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {


    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const elementId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.ELEMENT_ID);
        const includeRelatedRecords = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.INCLUDE_RELATED_RECORDS);

        // Element ID being present comes from site-map
        const includeDisplay = elementId ? true : false;
        const screenFields = elementId ? 'sys_id,name,macroponent,screen_type'.split(',') : false;
        const screenHandler = new Screen(screenFields, apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN), includeDisplay);
        const bundleExtensionsHandler = new BundleExtensions();




        // This is called by sn-ui-builder to fetch screen and related things
        if (includeRelatedRecords) {
            const {
                screen,
                screenAttrs,
                screenTestValues,
                contextState,
                eventDefinitions
            } = screenHandler.getScreenAndRelatedRecords(sysId);
            const bundleExtensions = bundleExtensionsHandler.getBundleExtensions(screen);


            apiHelper.getResponse({
                screen,
                screenAttrs,
                bundleExtensions,
                screenTestValues,
                contextState,
                eventDefinitions
            }, BuilderToolkitConstants.ERRORS.NO_SCREEN_FOUND);
        } else {
            const screen = elementId ? screenHandler.getSubrouteByElementID(sysId, elementId) : screenHandler.getRecordById(sysId);
            apiHelper.getResponse(screen, BuilderToolkitConstants.ERRORS.NO_SCREEN_FOUND);
        }
    });

})(request, response);
