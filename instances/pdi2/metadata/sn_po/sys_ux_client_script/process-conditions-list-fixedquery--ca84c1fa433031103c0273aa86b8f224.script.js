/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        selectedEntity,
    } = api.state;
    if (selectedEntity && selectedEntity.table) {
        return `table=${selectedEntity.table.value}^entity=${selectedEntity._row_data.uniqueValue}^finding_defISEMPTY`;
    }
}
