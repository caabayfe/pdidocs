/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.moduleType == "column_level_encryption" || api.state.moduleType == "password2")
        return false;

    return true;
}
