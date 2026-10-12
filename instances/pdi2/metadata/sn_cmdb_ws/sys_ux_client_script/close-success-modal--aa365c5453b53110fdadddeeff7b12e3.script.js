/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { PAGE_ROUTES } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { TASK_PAGE_PARAMS } = imports["sn_cmdb_ws.CMDBWsDMTaskUtil"]();

    const params = {
        [TASK_PAGE_PARAMS.MY_WORK.REFRESH_LIST]: Date.now() + ''
    };

    helpers.navigate.to(PAGE_ROUTES.MY_WORK, {}, params);
}
