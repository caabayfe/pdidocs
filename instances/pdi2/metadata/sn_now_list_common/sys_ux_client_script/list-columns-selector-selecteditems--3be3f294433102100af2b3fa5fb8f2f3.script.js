/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const selectedColumns = api.state.editColumnsState?.selectedColumns || api.data.controller.editColumnsProps.selectedColumns;
    return selectedColumns.slice();
}
