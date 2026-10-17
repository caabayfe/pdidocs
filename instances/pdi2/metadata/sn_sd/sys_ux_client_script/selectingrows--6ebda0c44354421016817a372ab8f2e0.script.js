/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!Array.isArray(event.payload.value)) {
        let selectedRows = [];
        let selectedRowsCount = 0;
        let rowsPayload = event.payload.selectedRows;

        for (let item in rowsPayload) {
            selectedRowsCount++;
            selectedRows.push(item);
        }

        api.setState('selectedRowsCount', selectedRowsCount);
        api.setState('selectedRows', selectedRows);
    }
}
