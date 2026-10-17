function handler({api, event, helpers, imports}) {
    if (api.data.related_list_tabs_transform.output.length > 0) {
        api.setState("hideList", false);
        api.setState("hideEmptyState", true);
    }
    else {
        api.setState("relatedListData", []);
        api.setState("selectedItem", [[]]);
        api.setState("hideList", true);
        api.setState("hideEmptyState", false);
    }
}
