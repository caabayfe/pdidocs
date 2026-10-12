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
    helpers.timing.setTimeout(function() {
        const sysId = api.data.get_upgrade_plan_items_2.output.sys_id;
        if (!sysId) {
            this.window.open("/sys_upgrade_plan_list.do");
        }  
         this.window.open(`/sys_upgrade_plan.do?sys_id=${sysId}`);
    });
}
