/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.navigate.to('process-configuration', {}, null, true);
    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
