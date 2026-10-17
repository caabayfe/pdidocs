function script({ api, event, helpers, imports }) {
    //Related Items handleSortSelectorChanged script; event fired when a new sort is selected from dropdown
    const newSort = event.payload.value;
    const ciSysIds = api.context.props.relatedItemSysids;
    const relatedItemCategorySysId = api.state.relatedItemCategorySysId;
    if (!ciSysIds || ciSysIds.length === 0) {
        // TODO: This is an error. the related items should not have zero associated CI sys_id.
        return;
    }
    if (!relatedItemCategorySysId) {
        // this is an error, the related list sys_id is required
        // TODO: Bubble error alert to main page
        return;
    }
    const [sortField, sortDir] = newSort.split(":"); 
    api.setState("selectedSortId", newSort);
    api.data.get_related_item_records.execute({
        "payload": {
            "relatedItemCategorySysId": relatedItemCategorySysId,
            "sortField": sortField,
            "sortDirection": sortDir,
            "ciList": ciSysIds,
            "startIndex": 0, //TODO: this is not implemented yet as we do not have paging on related items detals module
            "endIndex": 100, //TODO: this is not implemented yet as we do not have paging on related items detals module,
            "workspaceId": api.context.app.appId,
            "configIdentifierId": api.context.props.configIdentifierId
        }
    });
}
