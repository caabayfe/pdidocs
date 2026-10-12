/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Refreshes the list. This is done to get around the issue of configuration updates not reflecting automatically
    api.setState("refreshTimeStamp", new Date().getMilliseconds());
}
