/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var tableName = api.state.mifview 
        ? 'sn_instance_clone_request_vtable' 
        : 'sn_instance_clone_request';
api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: '/now/nav/ui/classic/params/target/' + tableName + '_list.do'
        }
    });
}
