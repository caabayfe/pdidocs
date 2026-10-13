/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    const {
        getRelativeTimeAsync,
        getNowDateTime,
        getFormattedDateText
    } = imports['sn_sow.SOWDateTimeHelper']();

    function arrangeEvents(timelineEvents, order) {
        let sortedEvents;
        if (order == "asc") {
            sortedEvents = timelineEvents.sort((event1, event2) => new Date(event1.timestamp) - new Date(event2.timestamp));
        } else {
            sortedEvents = timelineEvents.sort((event1, event2) => new Date(event2.timestamp) - new Date(event1.timestamp));
        }
        return sortedEvents;
    }

    function _getformattedDateTimeText(timelineUserPreferences, nowDateTime, relativeTime) {
        const dateTimeFormat = api.context.session.user.dateFormat.toUpperCase() + " " + api.context.session.user.timeFormat;
        let formattedDateTimeText = getFormattedDateText(nowDateTime, null, dateTimeFormat);
        return formattedDateTimeText;
    }

    async function groupEvents(timelineEvents, timediff, timelineUserPreferences, timeZone, helpers) {
        let groupedEvents = [];
        let proximityEvents = {
            "events": []
        };
        for (let index = 0; index < timelineEvents.length; index++) {
            let event = timelineEvents[index];
            // continue based on certain conditions for timeline settings
            if ((event.isHidden && !timelineUserPreferences.showHiddenEventsInEditView) ||
                (event.eventType == "CUSTOM_EVENT" && !timelineUserPreferences.showManuallyAddedEvents) ||
                (event.isDeleted)) {
                continue;
            }
            const localDateTime = getNowDateTime(event.timestamp, null, "UTC", timeZone);
            const formattedDateTimeText = _getformattedDateTimeText(timelineUserPreferences, localDateTime);
            event.formattedDateTime = formattedDateTimeText;
            if (Object.keys(proximityEvents.events).length == 0) { //Create proximity group events date time to display
                proximityEvents.timestamp = event.timestamp;
                proximityEvents.eventType = event.eventType;
                proximityEvents.formattedDateTime = formattedDateTimeText;
            }
            if (event.eventType == "INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT" || event.eventType == "INCIDENT_RESOLVED") { //Incident accepted as major incident or incident resolved type should not be grouped
                if (Object.keys(proximityEvents.events).length == 0) {
                    proximityEvents.events = [event];
                    groupedEvents.push(proximityEvents);
                    proximityEvents = {
                        "events": []
                    };
                } else {
                    groupedEvents.push(proximityEvents);
                    groupedEvents.push({
                        timestamp: event.timestamp,
                        formattedDateTime: formattedDateTimeText,
                        eventType: event.eventType,
                        events: [event]
                    });
                    proximityEvents = {
                        "events": []
                    };
                }
            } else if (Math.abs((new Date(event.timestamp) - new Date(proximityEvents.timestamp))) / 1000 <= timediff) { //Add to the group if the event is in close proximity
                proximityEvents['events'].push(event);
            } else { //Start creating a new promixity group
                groupedEvents.push(proximityEvents);
                proximityEvents = {
                    timestamp: event.timestamp,
                    formattedDateTime: formattedDateTimeText,
                    eventType: event.eventType,
                    events: [event]
                };
            }
        }
        if (Object.keys(proximityEvents.events).length != 0) { //Adding the left out grouped events
            groupedEvents.push(proximityEvents);
        }
        return groupedEvents;
    }

    let incidentTimings = api.state.rawTimelineEvents;
    const timelineUserPref = api.state.timelineUserPreferences;
    api.setState("timelineUserPreferences", timelineUserPref);

    //sort the events
    incidentTimings = arrangeEvents(incidentTimings, timelineUserPref.orderOfEvents);

    //group the events
    const eventGroupingInSeconds = timelineUserPref.eventGrouping.enabled ? timelineUserPref.eventGrouping.eventGroupingInSeconds : 0;
    const groupedEvents = await groupEvents(incidentTimings, eventGroupingInSeconds, timelineUserPref, api.context.session.user.timeZone, helpers);

    api.setState("timelineEvents", groupedEvents);
}
