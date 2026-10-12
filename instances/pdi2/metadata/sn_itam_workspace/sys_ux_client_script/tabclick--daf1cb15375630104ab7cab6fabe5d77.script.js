function handler({api, event, helpers, imports}) {
    var selectedTabIndex = event.payload.selectedTabIndex;
    var params = api.data.inventory_tabs.output[selectedTabIndex];
    params['selectedTabIndex'] = selectedTabIndex;

    api.emit("CONTENT_UPDATED", {
            params
        });
}
