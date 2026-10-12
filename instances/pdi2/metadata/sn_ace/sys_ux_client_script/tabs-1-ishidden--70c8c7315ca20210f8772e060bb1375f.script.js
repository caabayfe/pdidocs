/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    if (api.context.app.use_legacy_module_item == false) {
        return false;
    }
    return true;
}
