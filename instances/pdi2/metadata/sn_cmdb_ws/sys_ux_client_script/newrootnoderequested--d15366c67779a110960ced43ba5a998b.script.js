function script({ api, event, helpers, imports }) {
    //newRootNodeRequested script in Map Search Filter UI Controller; fired after user right clicks a node and selects "set as home node" (or similar)
    api.emit('SN_UNIFIED_MAP_CTRL#ROOT_NODE_SET', {
        params: {
            "rootNode": event.payload.node.id,
            "selectedNodeSysid": event.payload.node.id,
            "selectedNodeClass": api.data.getMapDataController.ciData[event.payload.node.id].properties['sys_class_name'].value,
            "selectedConnectionId": ""
        }
    });

}
