function script({api, event}) {
    //typeaheadSearchItemSet script in Map Search Filter UI Controller; firing an event to notify new root node has been set
    api.setState("disableEditMode", true);
    api.emit('SN_UNIFIED_MAP_CTRL#ROOT_NODE_SET', {params: event.payload.params});
}
