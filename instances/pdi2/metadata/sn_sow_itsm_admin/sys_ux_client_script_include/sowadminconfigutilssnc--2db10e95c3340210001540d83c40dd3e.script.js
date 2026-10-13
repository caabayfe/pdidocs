function include({ imports }) {

	/**
	 * Returns Sort Events that are sorted on timestamp
	 * 
	 * @param {JSON} [events]		the JSON formatted events where each event having timestamp value
	 * @param {String} [order]		the sorting order asc or desc
	 */
	const sortEvents = function (events, order) {
		let sortedEvents;
		if (order == "asc") {
			sortedEvents = events.sort((event1, event2) => new Date(event1.timestamp) - new Date(event2.timestamp));
		} else {
			sortedEvents = events.sort((event1, event2) => new Date(event2.timestamp) - new Date(event1.timestamp));
		}
		return sortedEvents;
	}

    const getDateTimestamp = function (currFormattedDateTime, prevFormattedDateTime, formattedDateTimeText) {
        let index = currFormattedDateTime.indexOf(' ');
        let prevDateTime = prevFormattedDateTime.substring(0, index);
        let currDateTime = currFormattedDateTime.substring(0, index);;
        let diff = Math.abs(new Date(prevDateTime) - new Date(currDateTime));
        if (diff === 0) {
            index = formattedDateTimeText.indexOf(' ');
            return formattedDateTimeText.substring(index + 1);
        } else
            return formattedDateTimeText;
    }

    const checkOnDateTimestamp = function (events) {
         let noOfEvents = events.length - 1;
        for (let index = 0; index < events.length; index++) {
            let currFormattedDateTime = events[index].timestamp;
            let formattedDateTimeText = events[index].formattedDateTimeText;
            if ((index === 0)|| (index === noOfEvents))
                events[index].formattedDateTime = events[index].formattedDateTimeText; 
            else {
                let prevFormattedDateTime = events[index - 1].timestamp;
                events[index].formattedDateTime = getDateTimestamp(currFormattedDateTime, prevFormattedDateTime, formattedDateTimeText);
            }
        }
        return events;
    }

	/**
	 * Returns Grouped Events
	 * 
	 * @param {JSON} [events]		the JSON formatted events in sorted order
	 */
	const groupEvents = function (events, eventSources) {
		let groupedEvents = [];
        let proximityEvents = {
            "events": []
        };
        let milestones = (eventSources && eventSources.milestones) ? eventSources.milestones : false;
        for (let index = 0; index < events.length; index++) {
            let event = events[index];
            //Incident accepted as major incident or incident resolved type should not be grouped
            if (!milestones && (event.eventType == "INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT" || event.eventType == "INCIDENT_RESOLVED"))
                    continue;
            proximityEvents = {
                timestamp: event.timestamp,
                formattedDateTimeText: event.formattedDateTimeText,
                eventType: event.eventType,
                events: [event]
            };
			groupedEvents.push(proximityEvents);
        }
        const noOfEvents = groupedEvents.length - 1;
        groupedEvents[noOfEvents].hide = true;
        for (let j=0; j < groupedEvents[noOfEvents].events.length; j++)
            groupedEvents[noOfEvents].events[j].hide = true;
        groupedEvents = checkOnDateTimestamp(groupedEvents);
        return groupedEvents;
	}
	
	/**
	 * Returns Grouped Events
	 * 
	 * @param {JSON} [events]		the JSON formatted events in sorted order
	 * @param {Number} [timediff]	the time difference in seconds to group the events
	 */
	const groupEventsByTimeDiff = function (events, timediff, eventSources) {
		let groupedEvents = [];
        let proximityEvents = {
            "events": []
        };
        let milestones = (eventSources && eventSources.milestones) ? eventSources.milestones : false;
        for (let index = 0; index < events.length; index++) {
            let event = events[index];
            //Create proximity group events date time to display
            if (Object.keys(proximityEvents.events).length == 0) {
                proximityEvents.timestamp = event.timestamp;
                proximityEvents.eventType = event.eventType;
                proximityEvents.formattedDateTimeText = event.formattedDateTimeText;
            }
            //Incident accepted as major incident or incident resolved type should not be grouped
            if (event.eventType == "INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT" || event.eventType == "INCIDENT_RESOLVED") {
                if (milestones) {
                    if (Object.keys(proximityEvents.events).length == 0) {
                        proximityEvents.events = [event];
                        groupedEvents.push(proximityEvents);
                        proximityEvents = {"events": []};
                    } else {
                        groupedEvents.push(proximityEvents);
                        groupedEvents.push({
                            timestamp: event.timestamp,
                            formattedDateTimeText: event.formattedDateTimeText,
                            eventType: event.eventType,
                            events: [event]
                        });
                        proximityEvents = {
                            "events": []
                        };
                    }
                }
            } else if (Math.abs((new Date(event.timestamp) - new Date(proximityEvents.timestamp))) / 1000 <= timediff) {
                //Add to the group if the event is in close proximity
                proximityEvents['events'].push(event);
            } else { 
                //Start creating a new promixity group
                if (Object.keys(proximityEvents).length != 0) {
                    groupedEvents.push(proximityEvents);
                }
                proximityEvents = {
                    timestamp: event.timestamp,
                    formattedDateTimeText: event.formattedDateTimeText,
                    eventType: event.eventType,
                    events: [event]
                };
            }
        }
        if (Object.keys(proximityEvents.events).length != 0) {
            //Adding the left out grouped events
            groupedEvents.push(proximityEvents);
        }
        
        const noOfEvents = groupedEvents.length - 1;
        groupedEvents[noOfEvents].hide = true;
        for (let j=0; j < groupedEvents[noOfEvents].events.length; j++)
            groupedEvents[noOfEvents].events[j].hide = true;
       console.warn('before groupedEvents = ' + JSON.stringify(groupedEvents));
        groupedEvents = checkOnDateTimestamp(groupedEvents);
       console.warn('after groupedEvents = ' + JSON.stringify(groupedEvents));
        return groupedEvents;
	}

	return {
		sortEvents,
		groupEvents,
		groupEventsByTimeDiff
	}
}
