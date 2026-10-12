/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const results = api.data.look_up_parent_records.results;
    const recordList = results && results.length && results.map((record) => ({
            id: record._row_data.uniqueValue,
            label: record._row_data.displayValue,
            sublabel: record.short_description && record.short_description.displayValue ||
                record._row_data.uniqueValue
        })) || [];

    if (api.state.parent_record_look_up === '' || recordList.length === 0)
        recordList.unshift(api.state.record_generator_object);
    
    api.setState('parent_record_list', recordList);
}
