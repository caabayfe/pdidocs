/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state && api.state.interceptorExtraParams && api.state.interceptorExtraParams["kb-knowledge-base"]) {
        var restrictedList = api.state.kbList.filter(item =>
            item.id === api.state.interceptorExtraParams["kb-knowledge-base"]);
        return restrictedList;
    } else {
      return api.state.kbList;
    }
}
