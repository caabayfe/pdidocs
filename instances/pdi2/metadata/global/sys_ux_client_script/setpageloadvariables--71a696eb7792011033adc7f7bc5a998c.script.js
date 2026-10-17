/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.look_up_enabled.result.length != 0) {
        api.setState('masterEnabled', api.data.look_up_enabled.result.value.value == 'true');
    }
    api.setState('hasPermissions', api.data.look_up_scope.applicationId.applicationId == 'global' && (api.context.session.user.roles.indexOf('security_admin') >= 0 || api.context.session.user.roles.indexOf('maint') >= 0));
}
