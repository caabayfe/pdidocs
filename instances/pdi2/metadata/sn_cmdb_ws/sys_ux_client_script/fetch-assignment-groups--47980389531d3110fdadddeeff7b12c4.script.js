/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('assignmentGroupSearchTerm', event.payload.value);
    api.data.get_assignment_groups_with_dm_users_1.refresh();
}
