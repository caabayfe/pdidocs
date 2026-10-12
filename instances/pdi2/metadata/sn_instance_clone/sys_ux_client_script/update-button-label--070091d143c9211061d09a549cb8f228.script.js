/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    if (api.state.modelParams.modal_type == 'create') {
        return api.state.translations.save;
    }
    if (api.state.modelParams.modal_type == 'update') {
        return api.state.translations.update;
    }
    return "";
}
