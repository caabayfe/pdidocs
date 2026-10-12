/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        if(event.payload.sys_id) {
            this.window.open(`/sys_update.do?sys_id=${event.payload.sys_id}`);
        } else {
            this.window.open(`/sys_update_list.do?sysparm_query=release_date>=${api.state.fixScriptFilterDate}^ORDERBYDESCexecution_duration`);
        }
    });
}
