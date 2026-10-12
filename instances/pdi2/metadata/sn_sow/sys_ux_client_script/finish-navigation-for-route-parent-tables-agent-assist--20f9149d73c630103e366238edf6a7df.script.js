/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const trueUpTableInfo = api.data.resolve_route_parent_tables_agent_assist.output;
    const payload = api.state.navigationPayload; 
    let newPayload = payload; 
    if(trueUpTableInfo && payload) { 
        const {table, sysId, title} = trueUpTableInfo; 
        newPayload = {...payload, fields: {...payload.fields, table, sysId}, title}; 
    } 
    api.emit('NAV_ITEM_SELECTED', newPayload);
}
