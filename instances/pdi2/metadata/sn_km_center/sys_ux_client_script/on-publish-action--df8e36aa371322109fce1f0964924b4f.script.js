/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const pending = api.state.publishPending
    if (pending) {
        return;
    }

    api.emit('KC_RECORD#SAVE');

    // Set the pending state so we can handle any visual treatment we might want
    api.setState('publishPending', true);
}
