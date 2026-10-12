/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.data.plugin_status_1.output.active){
        api.setState("fixedFilterCondition", "inbound_grant_type!=default^inbound_grant_type!=not_applicable^client_type!=guest_embedded^ORclient_type=null");
    }
}
