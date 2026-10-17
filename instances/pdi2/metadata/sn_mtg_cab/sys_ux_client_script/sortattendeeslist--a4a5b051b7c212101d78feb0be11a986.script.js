/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Script: SortAttendeesList
    const {item} = event.payload;
    api.setState('attendeesSort', item.order);
}
