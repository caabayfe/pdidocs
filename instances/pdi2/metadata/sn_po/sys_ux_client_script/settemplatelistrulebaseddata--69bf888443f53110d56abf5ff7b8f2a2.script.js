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
    const data = event.payload.rowDefinitions.rows;
    const filteredRows = data.map(item => {
        const cells = Object.values(item.cells);
        for (let [key, value] of Object.entries(item.cells)) {
            if (key == 'category' || key == 'subcategory') {
                if (item.cells[key].label) {
                    item.cells[key].value = item.cells[key].label;
                }
            }
        };
        return item;
    });

    api.setState('ruleBasedList', {
        "rows": filteredRows
    });
    if (Array.isArray(filteredRows) && filteredRows.length > 0) {
        api.setState('templateOverlayMessage', {});
    }
}
