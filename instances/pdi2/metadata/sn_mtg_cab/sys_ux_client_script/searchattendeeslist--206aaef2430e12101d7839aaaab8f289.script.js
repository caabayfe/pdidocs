/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const searchTerm = (event.payload.searchTerm === '') ? '__firstInit' : event.payload.searchTerm;
    api.setState('attendeeSearchTerm', searchTerm);
    api.setState('attendeesPage', 1);
}
