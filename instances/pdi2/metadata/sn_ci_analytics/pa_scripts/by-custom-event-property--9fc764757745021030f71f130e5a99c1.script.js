function getEventPropIds(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        var props = (!gs.nil(event) && !gs.nil(event.event_props)) ? event.event_props : [];
        var propIds = [];
        props.forEach(function(propObj) {
            propIds.push(propObj.prop_id);
        });
        return propIds;
    } catch (e) {
        return null;
    }
}
getEventPropIds(current.event_payload);
