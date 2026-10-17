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
    const {
        elementId
    } = event;
    const { sysId } = api.context.props;

    const showNotification = elementId == 'create_definition'
        ? RETIREMENT_DEF_MSG_CODES.CREATE_DEF_SUCCESS
        : RETIREMENT_DEF_MSG_CODES.UPDATE_DEF_SUCCESS;
    
    helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
        showNotification,
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
    } else {
        api.data.look_up_record.refresh();
    }
}
