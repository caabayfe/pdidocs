/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const table = event.payload?.table;
    const sysId = event.payload?.sys_id;
    const url = `/${table}?sys_id=${sysId}`;
    helpers.timing.setTimeout(function() {
        this.window.open(url);
    });
}
