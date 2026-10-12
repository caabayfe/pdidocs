function script({ api, event, helpers, imports }) {
    //syncCheck script in Map Search Filter UI Controller; fired after one of many events completes to check if all in a series have completed
    const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

    var events = cloneDeep(api.state.events);
    var syncEvent = event.payload.syncEvent;
    var requiredEvts = events.sync[syncEvent];

    if (!requiredEvts) {
        //no syncing scheduled so just execute target
        helpers.timing.setTimeout(() => {
            api.emit(syncEvent);
        }, 0);
    } else {
        //mark event as completed since it needs to be synced
        events.completed.push(event.payload.originatingEvent);
        api.setState('events', events);

        //now see if the required events are completed for the syncEvent
        if (requiredEvts.every(evt => events.completed.includes(evt))) {
            if (event.payload.clearOnSync) {
                //remove entry from events.sync and events.completed so it doesn't execute again
                requiredEvts.forEach(e => events.completed.splice(events.completed.indexOf(e), 1));
                delete events.sync[syncEvent];
            }
            helpers.timing.setTimeout(() => {
                //execute target event now that all prerequisites are met
                api.emit(syncEvent);
            }, 0);
        }
    }
}
