/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const sysId = api.data.look_up_multiple_records_2.results[0].sys_id.value;
    helpers.timing.setTimeout(function() {
        this.window.open(`/sys_trigger.do?sys_id=${sysId}`);
    });
}
