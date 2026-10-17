/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { name, value } = event.payload;
    if (name == 'fieldPayload') {
        api.setState('fieldPayload', value);
    }

    if (name == 'fieldPayloadValue' && typeof value == "object") {
        api.setState('fieldPayloadValue', value);
    }
}
