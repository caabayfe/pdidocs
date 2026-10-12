/**
 * @param {params} params 
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    //keep track of the selected table
    if (event.payload.item) {
        api.setState('cb_table_displayName', event.payload.item.label);
        api.setState('cb_table_name', event.payload.item.id);
    }
}
