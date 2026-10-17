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
    let results = api.data.look_up_related_records.results;
    let selectedRecords = [];
    results.map((res) => {
        if (res.document_id && res.document_id.value)
            selectedRecords.push(res.document_id.value);
    });

    let rowDefinitions = api.data.list_controller.rowDefinitions;
    let newRows = [];
    if (rowDefinitions?.rows.length) {
        rowDefinitions.rows.map((row) => {
            if (selectedRecords.indexOf(row.key) >= 0) {
                row.isSelected = true;
                row.selectionDisabled = true;
            }
            newRows.push(row);
        });
    }
    api.setState('associatedRecords',selectedRecords);
    api.setState('rowDefinitions', { ...rowDefinitions,
        rows: newRows
    });
}
