/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('userNameSearchTerm', '');
    api.setState('selectedUserToAssign', '');
    api.setState('selectedUserToAssignName', '');
    api.setState('showAssignedUserAlert', false);
    api.setState('assignInvalidState', false);
}
