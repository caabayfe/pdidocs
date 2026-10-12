function script({ api, event, helpers, imports }) {
    //setUIStatesByMapType script in Map Search Filter UI Controller; handler for SN_UNIFIED_MAP_CTRL#SET_STATE_BY_MAP_TYPE event
    const { MAP_TYPE } = imports['sn_cmdb_ws.unifiedMapUtils']();
    var mapType = event.payload?.mapType;

    if (MAP_TYPE.DEPENDENCY === mapType) {
        api.setState("disableEditMode", false);
        helpers.translate("Edit map").then((translatedText) => {
            api.setState("editModeTooltip", translatedText);
        });
    }
    else if (MAP_TYPE.SERVICE_INSTANCE === mapType) {
        api.setState("disableEditMode", true);
        helpers.translate("Editing of a service instance map is not supported").then((translatedText) => {
            api.setState("editModeTooltip", translatedText);
        });
    }
    else {
        api.setState("disableEditMode", true);
        helpers.translate("Editing is only supported for dependency maps").then((translatedText) => {
            api.setState("editModeTooltip", translatedText);
        });
    }

}
