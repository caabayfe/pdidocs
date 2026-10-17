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
    if (event.elementId === 'process_config_list' || event.elementId === 'content_pack_list') {
        const rowsData = [...api.state.processConfigurationsList.rows];
        const selectedRows = [];

        for (const selectedId of event.payload.selectedRecords) {
            const matchingRow = rowsData.find(row => row.key === selectedId);
            if (matchingRow) {
                selectedRows.push({
                    id: selectedId,
                    label: matchingRow.cells.table.label,
                });
            }
        }

        api.setState('selectedConfigListItems', selectedRows);
        return;
    }
    const {
        selectedConfigListItems
    } = api.state;
    const selectionKeys = Object.keys(event.payload.selectedRows);

    const selectedRows = [];

    for (const [key, value] of Object.entries(event.payload.selectedRows)) {
        selectedRows.push({
            id: key,
            label: value.cells.table.label,
        });
    }

    api.setState('selectedConfigListItems', selectedRows);
}
