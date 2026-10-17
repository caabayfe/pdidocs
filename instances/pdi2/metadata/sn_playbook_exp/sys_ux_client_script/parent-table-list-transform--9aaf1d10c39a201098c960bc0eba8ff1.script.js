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

        if (table.value === api.context.props.table) 
            api.setState('table_name', table.label);

        return listEntry;
    });

    if (tableList && tableList.length)
        api.setState('parent_table_list', tableList);   
}
