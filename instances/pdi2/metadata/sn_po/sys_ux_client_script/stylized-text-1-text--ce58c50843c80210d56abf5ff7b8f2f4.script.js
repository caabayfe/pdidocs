/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.editing && api.state.automatedFindingForm.type?.list?.length > 0) {
        const pattern = api.state.automatedFindingForm.type.list.find((type)=> type.id == api.state.automatedFindingForm.type.value);
        return pattern?.label;
    } else {
        return api.state.automatedFindingForm.type.label;
    }
}
