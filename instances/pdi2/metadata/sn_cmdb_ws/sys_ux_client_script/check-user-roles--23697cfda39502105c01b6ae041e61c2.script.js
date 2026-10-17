/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var userHasCmdbAdmin = api.context.session.user.roles.includes('sn_cmdb_admin');
    var userHasAdmin = api.context.session.user.roles.includes('admin');
    var userHasMaint = api.context.session.user.roles.includes('maint');

    api.setState('isAdminUser', userHasCmdbAdmin || userHasAdmin || userHasMaint);
}
