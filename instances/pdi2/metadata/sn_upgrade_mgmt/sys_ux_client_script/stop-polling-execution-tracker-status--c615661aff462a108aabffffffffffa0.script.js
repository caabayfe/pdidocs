/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("installProgressModalHeader","Installation progress");
    api.setState("isUpdateComplete",false);
    
 helpers.timing.setTimeout(function() {
        helpers.timing.clearInterval(this.window.modalPollInterval);
    });
}
