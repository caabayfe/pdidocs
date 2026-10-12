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
    const interceptorExtraParams = api.context.props.interceptorExtraParams;
    if (interceptorExtraParams) {
        const propsArray = interceptorExtraParams.split("/");
        let interceptorExtraParamsProp = {};
        for (let i = 0; i < propsArray.length; i += 2) {
            interceptorExtraParamsProp[propsArray[i]] = propsArray[i + 1];
        }
        api.setState('interceptorExtraParams', interceptorExtraParamsProp);
        if (interceptorExtraParamsProp && interceptorExtraParamsProp["kb-knowledge-base"]) {
            api.setState('knowledgeBaseSysId', interceptorExtraParamsProp["kb-knowledge-base"]);
            api.setState('selectedKnowledeBase', [[interceptorExtraParamsProp["kb-knowledge-base"]]]);

            if (interceptorExtraParamsProp && interceptorExtraParamsProp["kb-template"]) {
                api.setState('template', interceptorExtraParamsProp["kb-template"]);
                api.setState('selectedTemplate', [[interceptorExtraParamsProp["kb-template"]]]);
            }

        }

        if (interceptorExtraParamsProp && interceptorExtraParamsProp["source"]) {
            api.setState('sourceTable', interceptorExtraParamsProp["source"]);
        }
        if (interceptorExtraParamsProp && interceptorExtraParamsProp["source-id"]) {
            api.setState('sourceId', interceptorExtraParamsProp["source-id"]);
        }

        if (interceptorExtraParamsProp && interceptorExtraParamsProp["query"]) {
            api.setState('interceptorQueryParam', interceptorExtraParamsProp["query"]);
        }

        if(interceptorExtraParamsProp && interceptorExtraParamsProp["articleIds"]){
            api.setState('duplicateArticleIds', interceptorExtraParamsProp["articleIds"]);
        }
    } else if (api.context.props.gapsSysIds) {
        // gapsSysIds comes as a route prop in the gaps flow, which arrives without interceptorExtraParams.
        api.setState('gapsSysIds', api.context.props.gapsSysIds);
    }
}
