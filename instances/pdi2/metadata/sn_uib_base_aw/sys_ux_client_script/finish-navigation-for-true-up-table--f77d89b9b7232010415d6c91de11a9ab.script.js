/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) { 
    const trueUpTableInfo = api.data.resolve_route_parent_tables.output; 
    const payload = api.state.navigationPayload; 
    let newPayload = payload; 
    if(trueUpTableInfo && payload) { 
        const {table, sysId, title} = trueUpTableInfo; 
        newPayload = {...payload, fields: {...payload.fields, table, sysId}, title}; 
    } 
    api.emit('NAV_ITEM_SELECTED', newPayload); 
}
