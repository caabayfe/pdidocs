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
    const popoverDefs = { ...api.state.popoverDefinition
    };
    const popoverConfig = event.payload;
    if (popoverConfig?.content?.isLoading) {
        popoverDefs.content = { ...popoverDefs.content,
            ...popoverConfig.content
        };
        popoverDefs.popoverTimeStamp = popoverConfig.popoverTimeStamp;
        api.setState('popoverDefinition', popoverDefs);
    } else {
        api.setState('popoverDefinition', popoverConfig);
    }
}
