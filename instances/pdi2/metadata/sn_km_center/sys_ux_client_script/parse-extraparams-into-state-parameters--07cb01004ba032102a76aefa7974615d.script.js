/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const extraParams = api.context.props.extraParams;
    if (extraParams) {
        const propsArray = extraParams.split(":");
        let extraParamsProp = {};
        for (let i = 0; i < propsArray.length; i += 2) {
            extraParamsProp[propsArray[i]] = propsArray[i + 1];
        }
        api.setState('extraParams', extraParamsProp);
    }

    const query = api.context.props.query;
    if (query) {
        const propsArray = query.split("^");
        let interceptorExtraParamsProp = {};
        for (let i = 0; i < propsArray.length; i++) {
            if (propsArray[i].startsWith("source=")) {
                var sourceId = propsArray[i].split("=")[1];
                api.setState('sourceId', sourceId);
            }
        }
    }

}
