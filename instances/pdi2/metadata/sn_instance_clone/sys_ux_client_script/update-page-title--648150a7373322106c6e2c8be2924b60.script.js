/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        helpers.screen.updateStatus({
            title: api.data.record.form.header.primaryItem.displayValue
        });
    }, 1000);
}
