function script({ api, event, helpers, imports }) {
    // Set the slush bucket available and selected related items categories. If the item is excluded it is not selected
    api.setState("relatedItemsCategoriesLoaded", true);
    const availableItems = {
        "sn_cmdb_ws_node_map_related_item": {}
    };
    const selectedItems = [];
    const allRelatedCategoriesRecords = api.state.relatedItemsAllCategories;
    const exclusionList = api.state.relatedItemExclusionList ? api.state.relatedItemExclusionList : "";
    const sortList = api.state.relatedItemSortOrderList ? api.state.relatedItemSortOrderList : "";

    allRelatedCategoriesRecords.sort(function(a, b) {
        var aIndex = sortList.indexOf(a.sys_id);
        var bIndex = sortList.indexOf(b.sys_id);
        if (aIndex === -1 && bIndex === -1) {
            return 0; // Leave the elements in their original order
        } else if (aIndex === -1) {
            return 1; // Move 'a' to the end
        } else if (bIndex === -1) {
            return -1; // Move 'b' to the end
        } else {
            return aIndex - bIndex; // Sort based on the index in the 'sortLIST' array
        }
    });

    allRelatedCategoriesRecords.forEach(category => {
        if (!exclusionList.includes(category.sys_id)) {
            selectedItems.push([{
                "id": category.sys_id,
                "label": category.name
            }]);
        }
        availableItems["sn_cmdb_ws_node_map_related_item"][category.sys_id] = {
            "label": category.name,
            "reference": null
        };
    });
    api.setState("relatedItemCategoriesAvailable", availableItems);
    api.setState("relatedItemCategoriesSelected", selectedItems);
}
