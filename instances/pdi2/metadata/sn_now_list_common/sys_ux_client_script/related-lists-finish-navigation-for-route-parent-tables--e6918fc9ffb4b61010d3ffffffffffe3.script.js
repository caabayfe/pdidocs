/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //Copy of client script 3de5750743212110a2cbe32b5bb8f21f
    // Contains the child table of a record opened from a parent table.
    // For example, passing the task table along with the sysId for INC0000001
    // to this data broker would map to the incident table.
    const trueUpTableInfo = api.data.resolve_route_parent_tables.output;
    const payload = api.state.navigationPayload;
    let newPayload = payload;
    if (trueUpTableInfo && payload) {
        const {table, sysId, title} = trueUpTableInfo;
        newPayload.fields.sysId = sysId;
        if (table) {
          newPayload.fields.table = table;  
        }
        if (title) {
          newPayload.title = title;
        }
    }
    api.emit('NAV_ITEM_SELECTED', newPayload);
}
