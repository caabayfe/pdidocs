function script({ api, event, helpers, imports }) {
    // Refresh related lists in Related Items controller, refreshes the available related aggregate categories when a user changes their related items preferences
    api.setState("cache", {});
    api.data.get_related_lists.refresh();
    api.data.get_related_item_counts.refresh();
}
