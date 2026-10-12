/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { POLICY_NOTIFICATION_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const { 
        DM_PAGE_TABS,
        DM_POLICIES_PAGE_SUBTABS,
        PAGE_ROUTES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
        showNotification: POLICY_NOTIFICATION_MSG_CODES.POLICY_PUBLISH_SUCCESS,
        selectedTabIndex:  DM_PAGE_TABS.POLICIES,
        subSelectedTabIndex: DM_POLICIES_PAGE_SUBTABS.PUBLISHED_POLICIES,
        ts: Date.now()
    });
}
