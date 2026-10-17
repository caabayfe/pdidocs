/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let roles = api.data.fetch_list_of_roles.output.roles;
    let donutData = {},
        groupBy = {},
        metadata = {};
    if (roles.length > 0) {
        groupBy.id = "role";
        groupBy.fieldType = "reference";
        groupBy.label = "Role";
        groupBy.elements = roles;
        metadata.groupBy = [groupBy];
        donutData.metadata = metadata;
        donutData.data = api.data.fetch_list_of_roles.output.donutData;
    }
    if (api.state.selectedRoleId == null)
        api.setState('selectedRoleId', api.data.fetch_list_of_roles.output.selectedRole);
    if (api.state.selectedRoleLabel == null)
        api.setState('selectedRoleLabel', api.data.fetch_list_of_roles.output.selectedRoleLabel);
    api.setState('roleList', api.data.fetch_list_of_roles.output.roles);
    api.setState('visualizationData', [donutData]);
}
