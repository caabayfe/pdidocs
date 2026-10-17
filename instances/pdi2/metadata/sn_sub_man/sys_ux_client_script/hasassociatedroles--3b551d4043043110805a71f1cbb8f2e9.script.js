/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasAssociatedRolesRecords = api.data.has_associated_roles.output.data.GlideRecord_Query.sn_sub_man_license_application_roles._rowCount !== 0;
    api.setState('hasAssociatedRolesRecords', hasAssociatedRolesRecords);
}
