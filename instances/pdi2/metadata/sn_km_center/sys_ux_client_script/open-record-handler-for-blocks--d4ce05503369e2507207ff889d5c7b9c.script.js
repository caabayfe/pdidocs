/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        payload
    } = event;
    
    var redirectPayload = {
        redirect: true,
        targetRoute: 'current',
        fields: {
            sysId: payload.sys_id + "",
            table: payload.table + ""
        },
        params: {
            query: payload.params.query+""
        }
    };
    
    if(payload.sys_id == '-1') 
        redirectPayload.route = "record";
    else 
        redirectPayload.route = "kb_view";
    
    api.emit("NAV_ITEM_SELECTED", redirectPayload);
}
