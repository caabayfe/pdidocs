function script({ api, event, helpers, imports }) {
    //kebobMenuClicked script; fired after user clicks kebob menu item
    const { defaultLevels } = imports["sn_cmdb_ws.unifiedMapUtils"]();
    const { ATTRIBUTE_PANEL_OPEN_MAP_BASE_URL_KEY, ATTRIBUTE_PANEL_OPEN_MAP_DEFAULT_URL } = imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();

    const menu_options = {
        CI_DETAILS: "view_ci_details",
        NEW_MAP: "open_in_new_map",
        SET_HOME_NODE: "replace_map_root"
    };

    var splitArray = event.payload.action.id.split(":");
    const actionId = splitArray.length == 1 ? event.payload.action.id : splitArray[0];
    const table = splitArray.length == 1 ? api.context.props.ciClass: splitArray[1];
    const sysId = splitArray.length == 1 ? api.context.props.ciSysid : splitArray[2];
    const levels = api.context.props.levels || defaultLevels;
    const baseUrl = api.data.lookup_config_properties?.output[ATTRIBUTE_PANEL_OPEN_MAP_BASE_URL_KEY] || ATTRIBUTE_PANEL_OPEN_MAP_DEFAULT_URL;

    switch(actionId) {
        case menu_options.CI_DETAILS:
            helpers.navigate.to(
                'record',
                {
                    table,
                    sysId
                },
                null,
                null,
                null,
                'current'
            );
            break;
        case menu_options.NEW_MAP:
             // TODO: consume levels system property, for now default to 3
             helpers.navigate.to(
                null,
                null,
                null,
                false,
                false,
                null,
                { 
                    url: baseUrl + '/params/root-node/' + sysId + '/selected-node-sysid/' + sysId + '/selected-node-class/' + table + '/levels/' + levels
                },
            );
            break;
        case menu_options.SET_HOME_NODE:
            helpers.navigate.setRouteParams({'params': {
                "rootNode": sysId,
                "selectedNodeSysid": sysId,
                "selectedNodeClass": table,
                "selectedConnectionId": ''
            }});
            break;
    }
}
