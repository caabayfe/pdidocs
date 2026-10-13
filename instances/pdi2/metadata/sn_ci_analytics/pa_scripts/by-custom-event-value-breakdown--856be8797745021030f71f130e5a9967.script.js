function getEventPropValueIds(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        var props = (!gs.nil(event) && !gs.nil(event.event_props)) ? event.event_props : [];
        var breakdownIds = [];
        props.forEach(function(propObj) {
            breakdownIds.push(propObj.breakdown_id);
        });
        return breakdownIds;
    } catch (e) {
        return null;
    }
}
getEventPropValueIds(current.event_payload);
