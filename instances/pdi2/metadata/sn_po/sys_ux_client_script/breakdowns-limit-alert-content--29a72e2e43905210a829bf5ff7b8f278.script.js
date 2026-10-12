/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.selectedEntity || !api.state.selectedEntity.table) {
        return '';
    }
    return helpers.translateSync('This entity can only have {0} breakdowns', api.state.selectedEntity.parent_entity.value ? 5 : 10);
}
