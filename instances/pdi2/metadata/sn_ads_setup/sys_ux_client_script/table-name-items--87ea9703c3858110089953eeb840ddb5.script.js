/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    let tables = api.data.get_table_names.results ? api.data.get_table_names.results.map(table => {
        return {
            "id": table.name.value,
            "label": table.label.value,
            "sublabel": table.name.value
        };
    }): [];
    return tables;
}
