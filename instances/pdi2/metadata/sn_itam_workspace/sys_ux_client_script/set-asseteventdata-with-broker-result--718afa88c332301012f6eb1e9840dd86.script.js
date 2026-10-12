/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var output = api.data.getassetlifecycleevents_1.output; 
    api.setState('assetEventData', output);
    api.setState('assetEventDataComplete', output);
}
