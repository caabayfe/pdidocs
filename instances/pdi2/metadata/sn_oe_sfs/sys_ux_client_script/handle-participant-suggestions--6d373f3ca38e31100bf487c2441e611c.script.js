/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        name,
        payload: {
            eventName,
            eventPayload
        }
    } = event;

    if (eventName == 'ACTIVATE_PARTICIPANT_SUGGESTIONS') {
        var settings = api.state.settings;
        settings.fields.enable_participant_suggestions.value = eventPayload.value;    
        api.setState('settings', settings);
    }
}
