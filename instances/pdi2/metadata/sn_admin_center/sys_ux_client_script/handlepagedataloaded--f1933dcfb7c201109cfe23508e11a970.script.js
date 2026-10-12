/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {elementId, payload} = event;
    const {eventName, eventPayload} = payload;
    if (elementId === 'details_content_block' && eventName === 'PAGE_DATA_LOADED') {
        api.setState('businessData', eventPayload);
    }
}
