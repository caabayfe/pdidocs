
            /**
     * @param {params} params
     * @param {api} params.api
     * @param {any} params.event
     * @param {any} params.imports
     * @param {ApiHelpers} params.helpers
     */
    function handler({
        api,
        event,
        helpers,
        imports
    }) {
        var appIdValue = event.payload.fieldValue && typeof event.payload.fieldValue === "string" ? event.payload.fieldValue.trim() : event.payload.fieldValue;
        api.setState('appId', appIdValue);
    }
