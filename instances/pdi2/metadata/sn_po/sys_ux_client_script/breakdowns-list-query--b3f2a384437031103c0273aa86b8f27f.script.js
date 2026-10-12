/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedEntity && api.state.selectedEntity.table) {
        return `entity=${api.state.selectedEntity._row_data.uniqueValue}`;
    }
    return '';
}
