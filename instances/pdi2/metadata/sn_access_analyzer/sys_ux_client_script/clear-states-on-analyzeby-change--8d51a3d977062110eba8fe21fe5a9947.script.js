/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("selectedUser", null);
    api.setState("selectedGroup", null);
    api.setState("selectedRole", null);
    api.setState("userTypeaheadVal", null);
    api.setState("groupTypeaheadVal", null);
    api.setState("roleTypeaheadVal", null);
    api.setState("showMandatoryError", false);
}
