function script({api, event, helpers, imports}) {
    // do not fire this event on first load as it is a wasted filter operation, 
    // timestamp is initially set to NOW
    // and it's impossible to have a created on date that is in the future
    if (api.state.isFirstLoad) {
        api.setState("isFirstLoad", false);
        return;
    }
    const { getNowTimestamp } = imports["sn_cmdb_ws.unifiedMapTimelineUtil"]();
    let data;
    if (event.name === 'TIMELINE#MARKER_CLEARED') {
        // if a marker is cleared, need to set the timestamp to current time to show all nodes
        data = { timestamp: getNowTimestamp() };
    } else {
        // marker added event
        data = (event.payload?.data?.length > 0) ? event.payload.data[0] : { timestamp: getNowTimestamp() };
        api.setState('markerTimestamp', data.timestamp);
    }

    if (data.timestamp) {
        api.emit('SN_UNIFIED_MAP_CTRL#MARKER_TIMESTAMP_CHANGED', {
            data
        });
    } else {
        console.error("Did not find timestamp in payload for Unified Map timeline operation");
    }
}
