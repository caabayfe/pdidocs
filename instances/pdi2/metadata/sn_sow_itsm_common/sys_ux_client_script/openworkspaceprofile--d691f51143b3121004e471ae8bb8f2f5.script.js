/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.navigate.to('record', {
        table: 'sys_user',
        sysId: api.context.session.user.sys_id
    });
}
