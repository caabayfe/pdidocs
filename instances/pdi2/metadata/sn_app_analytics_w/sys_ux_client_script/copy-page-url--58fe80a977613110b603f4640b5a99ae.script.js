/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, imports, helpers}) {
    helpers.timing.setTimeout(function () {
        this.navigator.clipboard.writeText(this.location.href);
    });
}
