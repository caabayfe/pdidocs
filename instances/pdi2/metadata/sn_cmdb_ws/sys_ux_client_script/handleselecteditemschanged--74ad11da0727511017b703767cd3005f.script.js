function script({ api, event, helpers, imports }) {
    // Handles the selected item array changing in the slushbucket. Sets the exclusion list for later save.
    const { items } = event.payload;
    const allRelatedCategoriesRecords = api.state.relatedItemsAllCategories;
    const selectedIdArray = [];
    items.forEach(item => {
        // item should be a one object array
        if (item.length === 1) {
            selectedIdArray.push(item[0].id);
        }
    });

    //get the sort order
    const sortOrderItems = items.flat(1).map(item => item.id);

    // Filtering out entries
    const newExcludedItems = allRelatedCategoriesRecords.map(record => {
        return record.sys_id;
    }).filter(sysId => {
        return selectedIdArray.indexOf(sysId) < 0;
    })
    
    api.setState("relatedItemExclusionList", newExcludedItems.join());
    api.setState("relatedItemSortOrderList", sortOrderItems.join());
}
