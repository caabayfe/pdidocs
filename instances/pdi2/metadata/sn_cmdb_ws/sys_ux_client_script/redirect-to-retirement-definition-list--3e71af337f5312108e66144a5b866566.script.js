/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { RETIREMENT_DEF_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const { DM_PAGE_TABS, PAGE_ROUTES } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const showNotification = RETIREMENT_DEF_MSG_CODES.DELETE_DEF_SUCCESS;
    
    helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
        showNotification,
        selectedTabIndex: DM_PAGE_TABS.SETTINGS,
        ts: Date.now()
    }, null, null, 'current');
}
