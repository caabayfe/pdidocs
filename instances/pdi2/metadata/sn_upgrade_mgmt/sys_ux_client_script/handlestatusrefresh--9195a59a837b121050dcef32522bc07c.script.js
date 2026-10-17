/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        api.setState("statusTimeStamp", new Date().getMilliseconds());
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: handleStatusRefresh", e);
    }
}
