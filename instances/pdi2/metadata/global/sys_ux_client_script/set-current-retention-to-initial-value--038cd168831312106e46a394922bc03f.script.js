/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    // Updating the currChoice with the value received from the payload of db
    api.setState("currChoice", event.payload.value);
}
