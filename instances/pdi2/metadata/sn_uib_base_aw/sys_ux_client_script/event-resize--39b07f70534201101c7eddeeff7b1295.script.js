/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const newEvents = { ...api.state.timelineEvents };
    newEvents[event.payload.event.id] = {
        ...event.payload.event,
        start: event.payload.newStartMoment.format(api.state.dateTimeFormat),
        end: event.payload.newEndMoment.format(api.state.dateTimeFormat),
        startMS: event.payload.newStartMS,
        endMS: event.payload.newEndMS
    };

    api.setState('timelineEvents', newEvents);
}
