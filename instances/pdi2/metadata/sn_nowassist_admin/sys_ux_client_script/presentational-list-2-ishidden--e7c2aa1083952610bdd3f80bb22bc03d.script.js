/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.hideLoader == false ? true :((api.state.type == 'fetch_skill' && api.state.filteredSkillListCount > 0) ? false : true);
}
