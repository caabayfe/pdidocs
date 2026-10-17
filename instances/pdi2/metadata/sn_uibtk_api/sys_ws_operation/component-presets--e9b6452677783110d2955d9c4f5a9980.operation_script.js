(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysIdsToSkip = ['a571a832434d711025f01220bfb8f2f9'];
        const sysIdsToFetch = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_IDS);
        const includeClientScripts = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.INCLUDE_RELATED_RECORDS);
        const componentId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.ELEMENT_ID);

        const presetHandler = new ComponentPreset(null, includeClientScripts);

        const sysIdsCondition = sysIdsToSkip.map(sysId => `sys_id!=${sysId}`).join('^') + (sysIdsToFetch ? `^sys_idIN${sysIdsToFetch}` : '');
        const encodedQuery = componentId ? `component=${componentId}^${sysIdsCondition}` : sysIdsCondition;

        const componentPresets = presetHandler.getRecordsByQuery(encodedQuery, 'name');
        const presetEventApiNames = presetHandler.getPresetEventDefinitionApiNames([...(componentPresets ? componentPresets : [])]);
        const eventDefinitions = new UXEvent().getRecordsByQuery(`event_nameIN${presetEventApiNames}`, 'name');

        apiHelper.respondSuccesfully({
            componentPresets,
            eventDefinitions
        }, componentPresets.length === 0 ? 204 : 200);

    });

})(request, response);
