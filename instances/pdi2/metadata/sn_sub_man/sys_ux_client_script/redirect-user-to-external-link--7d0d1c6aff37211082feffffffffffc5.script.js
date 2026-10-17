/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const table = event.payload.table;
    const sys_id = event.payload.sys_id;
    let url = "/now/nav/ui/classic/params/target/" + table + ".do" + encodeURIComponent("?sys_id=" + sys_id);
    if (table === "sys_scope" || table === "sys_app" || table === "sys_store_app")
        url += "&sysparm_view=subscription";
    api.emit('CUSTOM_REDIRECT_URL', {url: url});
}
