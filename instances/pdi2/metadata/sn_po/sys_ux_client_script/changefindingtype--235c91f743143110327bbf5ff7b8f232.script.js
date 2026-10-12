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
    if (event.payload.selectedTabIndex == 0) {
        const listColumns = event.elementId == 'tabs_1' ? 'message,subcategory,category,impacted_kpis,sys_updated_on,sys_updated_by' : 'message,subcategory,category,impacted_kpis,sys_updated_on';
        if (event.elementId == 'tabs_1') {
            api.setState('listTable', 'promin_finding_def');
            api.setState('tabindex', 0);
        } else {
            api.setState('templateTabIndex', 0);
        }
    } else {
        const listColumns = event.elementId == 'tabs_1' ? 'name,type,category,impacted_kpis,sys_updated_on,sys_updated_by' : 'name,type,category,impacted_kpis,sys_updated_on';
        if (event.elementId == 'tabs_1') {
            api.setState('listTable', 'promin_automated_finding');
            api.setState('tabindex', 1);
        } else {
            api.setState('templateTabIndex', 1);
        }
    }
}
