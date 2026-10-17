(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const controllerPresetHandler = new ControllerPreset();
        const elementId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.ELEMENT_ID);
        const encodedQuery = elementId ? `controller=${elementId}` : 'controllerISNOTEMPTY';
        const controllerPresets = controllerPresetHandler.getRecordsByQuery(encodedQuery, 'name');
        const presetEventApiNames = controllerPresetHandler.getPresetEventDefinitionApiNames([...(controllerPresets ? controllerPresets : [])]);
        const eventDefinitions = new UXEvent().getRecordsByQuery(`event_nameIN${presetEventApiNames}`, 'name');

        apiHelper.respondSuccesfully({
            controllerPresets,
            eventDefinitions
        }, controllerPresets.length === 0 ? 204 : 200);
    });

})(request, response);
