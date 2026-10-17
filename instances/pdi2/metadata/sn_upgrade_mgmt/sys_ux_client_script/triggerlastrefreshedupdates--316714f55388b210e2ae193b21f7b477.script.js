/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var lastRefreshTime = new Date().toISOString();
    api.setState("lastRefreshTime", lastRefreshTime);
    api.setState("now", lastRefreshTime);
    helpers.timing.setInterval(function() {
        api.setState("now", new Date().toISOString());
    }, 60000);
}
