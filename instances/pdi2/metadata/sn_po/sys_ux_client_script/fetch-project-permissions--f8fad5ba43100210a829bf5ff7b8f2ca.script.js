/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 const permissions = api.data.fetch_project_permissions_1.output.data.snPo.GlidePromin.prominProjectPermissions;
 api.setState('permissions',permissions);
}
