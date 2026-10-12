/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { DM_PAGE_TABS, PAGE_ROUTES } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { sysId } = api.context.props;
    
    helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
        selectedTabIndex: DM_PAGE_TABS.SETTINGS,
        ts: Date.now()
    }, null, null, 'current');
    // Reset form
    if (sysId == -1) {
        api.setState('defActive', false);
        api.setState('cbTableName', '');
        api.setState('encodedQuery', null);
        api.setState('existingDefForTable', null);
        api.setState('validQuery', null);
    }
}
