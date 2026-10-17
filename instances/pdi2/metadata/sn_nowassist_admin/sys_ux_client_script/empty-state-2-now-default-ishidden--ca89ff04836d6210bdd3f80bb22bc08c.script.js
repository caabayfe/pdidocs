/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
   return (api.state.hideLoader == false || api.state.filteredSkillListCount > 0) ? true : false;
}
