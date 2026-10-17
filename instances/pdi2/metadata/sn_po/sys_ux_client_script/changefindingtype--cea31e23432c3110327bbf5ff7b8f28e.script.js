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
        api.setState('listTable', 'promin_finding_def');
        const listColumns =  'message,subcategory,category,sys_updated_on,sys_updated_by';
        api.setState('listColumns', listColumns);
    } else {
        api.setState('listTable', 'promin_automated_finding');
        const listColumns ='name,type,category,sys_updated_on,sys_updated_by';
        api.setState('listColumns', listColumns);
    }
}
