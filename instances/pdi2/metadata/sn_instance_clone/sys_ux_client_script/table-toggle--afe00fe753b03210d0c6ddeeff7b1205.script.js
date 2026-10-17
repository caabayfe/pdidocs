/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var miftable=api.state.mifview;
    if(miftable){
        api.setState("custom_table_name",'sn_instance_clone_request_vtable');
    }else{
        api.setState("custom_table_name",'sn_instance_clone_request');
    }
}
