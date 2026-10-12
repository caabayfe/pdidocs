/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        this.window.open('/sys_upgrade_history.do?sys_id=' + api.state.upgradeHistorySysID, '_blank');
    });
}
