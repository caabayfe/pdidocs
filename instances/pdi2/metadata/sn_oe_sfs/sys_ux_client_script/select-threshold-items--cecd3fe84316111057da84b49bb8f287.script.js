/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    var result =[];
    var records = api.data.offline_threshold_values.results || [];
    records.forEach(record => {
        result.push({
            id: record.value.value,
            label: record._row_data.displayValue
        });
    });
    return result;
}
