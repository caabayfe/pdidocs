/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const filterId = event.payload.filterId;
    const groupBy = [];
    if (filterId !== 'none')
        groupBy.push(filterId);
        
    api.setState('groupBy', groupBy);
}
