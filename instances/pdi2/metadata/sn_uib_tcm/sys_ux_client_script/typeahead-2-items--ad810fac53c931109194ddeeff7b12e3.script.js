/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let type = null,
        roles = [];
    if (api.state.selectedRecipientTypeAhead && api.state.selectedRecipientTypeAhead.type)
        type = api.state.selectedRecipientTypeAhead.type;
    if (api.state.roles && api.state.roles[type])
        roles = api.state.roles[type];
    return roles;
}
