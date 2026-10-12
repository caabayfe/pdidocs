/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
// Track "Healthscore Icon" on right panel"
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'View KM Healthscore Icon on right panel',
        value: {}
    });
}
