/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //reset state
    api.setState("searchTerm", "");
    api.setState("userIds", []);

    //close modal
    helpers.modal.close();
}
