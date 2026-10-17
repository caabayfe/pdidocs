function script({ api, event, helpers, imports }) {
    // updateStatesFromParamChange script in Map Search Filter UI Controller; handler for SN_UNIFIED_MAP_CTRL#SET_STATE_BY_MAP_TYPE event
    const { MAP_CONTAINER_DEFAULT_STYLE, MAP_CONTAINER_EDIT_STYLE } = imports['sn_cmdb_ws.unifiedMapUtils']();
    var eventParams = event.payload.params;

    var editModeState = eventParams["editMode"];
    if (editModeState && editModeState === "true") {
        api.setState("mapContainerStyle", MAP_CONTAINER_EDIT_STYLE);
    }
    else {
        api.setState("mapContainerStyle", MAP_CONTAINER_DEFAULT_STYLE);
    }
}
