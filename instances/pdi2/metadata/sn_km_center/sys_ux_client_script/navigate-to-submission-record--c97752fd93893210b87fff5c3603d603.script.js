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
    if (api.state.hasNavigatedToFormPage) {
        return;
    }
    api.setState('hasNavigatedToFormPage', true);
    const params = {
        "query": "parent=" + api.state.sourceId + "^" + api.state.query + (api.state && api.state.interceptorQueryParam ? "^" + api.state.interceptorQueryParam : "")
    };
    if (api.context.props.gapsSysIds) {
        params["extraParams"] = `gapsSysIds:${api.context.props.gapsSysIds}:`;
    }
    const fields = {
            "table": "kb_submission",
            "sysId": "-1"
        };

    // Close current tab
    api.emit('SCREEN_STATUS_CHANGED', {
        status: 'closed',
        skipNextScreenActivation: true
    });

    //Navigate to record page
    api.emit('NAV_ITEM_SELECTED', {
        route: "record",
        multiInstField: "sysId",
        fields,
        params
    });
    
}
