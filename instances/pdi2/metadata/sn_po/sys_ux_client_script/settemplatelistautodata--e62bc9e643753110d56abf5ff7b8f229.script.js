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
    const rows = event.payload.rowDefinitions.rows;
    let filteredRows = rows.filter((row) => api.state.activities.includes(row.cells.field.value));
 
    filteredRows = filteredRows.map(item => {
        const cells = Object.values(item.cells);
        for (let [key, value] of Object.entries(item.cells)) {
            if (key == 'field' || key == 'type') {
                if (item.cells[key].label) {
                    item.cells[key].value = item.cells[key].label;
                }
            }
        };
        return item;
    });

    api.setState('automatedList', {
        "rows": filteredRows
    });
    if (Array.isArray(filteredRows) && filteredRows.length > 0) {
        api.setState('templateOverlayMessage', {});
    }
}
