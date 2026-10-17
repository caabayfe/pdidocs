/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        id
    } = event.payload.item;
    if (!id)
        return;
    api.setState('userTable', 'sys_user_grmember');
    api.setState('assignmentGroupSysId', id);
    api.setState('assigneeSysId', '');
    api.setState('searchString', '');
}
