/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const searchTerm = api.state.attendeeSearchTerm || '__firstInit';
    api.setState('attendeeSearchTerm', searchTerm);
    api.setState('attendeesPage', parseInt(event.payload.value) + 1);
}
