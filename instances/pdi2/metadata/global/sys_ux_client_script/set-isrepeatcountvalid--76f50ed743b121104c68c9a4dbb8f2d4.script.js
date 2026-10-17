/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const isValid = !event.payload.value;
    api.setState("isRepeatCountValid", isValid);
    if (!isValid) 
        api.setState("invalidRepeatCountValue", event.payload.fieldValue);
}
