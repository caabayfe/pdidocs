/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {timelineEvents, currentEventMove} = api.state;
    const {event:e, group, newStartMS, newEndMS} = currentEventMove;
    const newEvent = {...e};
	const deltaDifference = newStartMS - e.startMS;

	if (Array.isArray(newEvent.childEvents)) {
		newEvent.childEvents.forEach(item => {
			item.startMS = item.startMS + deltaDifference;
			item.endMS = item.endMS + deltaDifference;
			item.start = new Date(item.startMS).toISOString();
			item.end = new Date(item.endMS).toISOString();
		});
	}
	newEvent.start = new Date(newStartMS).toISOString();
	newEvent.startMS = newStartMS;
	newEvent.end = new Date(newEndMS).toISOString();
	newEvent.endMS = newEndMS;
	newEvent.group = group;

    const newEvents = {...timelineEvents};
    newEvents[e.id] = newEvent;
    api.setState('timelineEvents', newEvents);
    api.setState('currentEventMove', {});
}
