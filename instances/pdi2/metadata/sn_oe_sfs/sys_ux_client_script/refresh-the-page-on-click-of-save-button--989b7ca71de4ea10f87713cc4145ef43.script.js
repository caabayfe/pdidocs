/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
if(api.state.saveButtonClicked ){
        helpers.timing.setTimeout(function() {
            this.top.window.location.reload();
        },4);
       }
}
