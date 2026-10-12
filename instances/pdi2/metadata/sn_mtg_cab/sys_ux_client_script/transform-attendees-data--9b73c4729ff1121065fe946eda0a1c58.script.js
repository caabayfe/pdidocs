/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    // Script: Transform Attendees Data
    const result = api.data[event.elementId].output.result || null;
    if (!result)
        return;

    const CABDataTransformer = imports['sn_mtg_cab.CABDataTransformer']();
    const cabDataTransformer = new CABDataTransformer();
    const attendeesList = result.attendeesData.attendees;
    if (event.elementId === 'cab_attendee_search') {
        const attendeesControl = JSON.parse(JSON.stringify(api.state.attendeesControl));
        attendeesControl.pagination = result.attendeesData.pagination;
        api.setState('attendeesControl', attendeesControl);
    }
    const attendees = cabDataTransformer.attendeeHydration(attendeesList);
    api.setState('attendees', attendees);
}
