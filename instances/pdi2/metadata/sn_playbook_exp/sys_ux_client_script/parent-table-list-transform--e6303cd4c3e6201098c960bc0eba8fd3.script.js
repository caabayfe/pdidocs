/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const results = api.data.table_list_loader.output.result;

    const tableList = results && results.length && results.map(table => {
        const listEntry = {
            id: table.value,
            label: table.label,
            sublabel: table.value
        };

        if (listEntry.id === api.context.props.table)
            api.setState('parent_table', listEntry);

        return listEntry;
    }) || [];

    if (tableList.length)
        api.setState('parent_table_list', tableList);
}
