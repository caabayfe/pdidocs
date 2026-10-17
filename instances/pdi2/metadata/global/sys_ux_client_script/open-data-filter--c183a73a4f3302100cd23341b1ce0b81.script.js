/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 * 
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId == "related_data_filter") {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'sys_security_data_filter.do?sys_id=' + event.payload.sys_id
            }
        });
    }
        if (event.elementId == "view_data_filter") {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'sys_security_data_filter.do?sys_id=' + api.state.dataFilterId
            }
        });
    }    
}
