/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {

    let prev = '-1';
    let uniqueViews = api.data.form_view_for_table.results ? api.data.form_view_for_table.results.filter(table => {
        if (prev == table.view.value) return false;
        prev = table.view.value;
        return true;
    }) : [];
    let tables = uniqueViews.map(table => {
        return {
            "id": table.view.displayValue,
            "label": table.view.displayValue
        };
    });

    return tables.length > 0 ? tables : [{
        "id": "Default view",
        "label": "Default view"
    }];

}
