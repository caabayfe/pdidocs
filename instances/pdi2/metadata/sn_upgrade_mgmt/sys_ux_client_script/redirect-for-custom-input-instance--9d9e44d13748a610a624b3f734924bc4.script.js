/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        if (!api.state.instanceInput || api.state.instanceInput.trim() === '') {
          return;
        }
        this.window.open("https://" + api.state.instanceInput + ".service-now.com/now/clone/ui/clone-request/-1");
    });
}
