function script({ api, event, helpers, imports }) {
    //Application service module, handleCardItemClicked script; fired after user clicks kebob menu item
    const rawId = event.payload.action.id;
    const [actionId, table, sysId] = rawId.split(":")
    const menu_options = {
        CIDetails: "view_ci_details",
        NewMap: "open_new_map",
        SetHomeNode: "replace_map_root"
    };

    if (actionId === menu_options.CIDetails) {
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
    }
    else if (actionId === menu_options.NewMap) {
        // TODO: consume levels system property, for now default to 3
        helpers.navigate.to(
            null,
            null,
            null,
            false,
            false,
            null,
            { 
                url: '/now/cmdb/home/sub/unifiedmap/params/root-node/' + sysId + '/selected-node-sysid/' + sysId + '/selected-node-class/' + table + '/levels/' + 3
            },
        );
    } else if (actionId === menu_options.SetHomeNode) {
        helpers.navigate.setRouteParams({'params': {
            "rootNode": sysId,
            "selectedNodeSysid": sysId,
            "selectedNodeClass": table,
            "selectedConnectionId": ''
        }})
    }
}
