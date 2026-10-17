/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Track "View Knowledge Base Health" button click on homepage
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Click Knowledge Base Health on homepage',
        value: {}
    });

}
