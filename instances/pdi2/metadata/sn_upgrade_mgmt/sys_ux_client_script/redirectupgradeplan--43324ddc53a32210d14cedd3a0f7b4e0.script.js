/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var url = "sys_upgrade_plan.do?sys_id=" + api.state.upgradePlanId;
    helpers.timing.setTimeout(function() {
        this.window.open(url);
    });
}
