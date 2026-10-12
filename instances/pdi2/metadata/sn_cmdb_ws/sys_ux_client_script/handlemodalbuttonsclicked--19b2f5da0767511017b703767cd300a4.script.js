function script({ api, event, helpers, imports }) {
    // handle related items modal buttons clicked
    const { relatedItemsExcludedCategoriesPrefName, relatedItemsSortOrderPrefName, buildUserPrefWithAppId } = imports["sn_cmdb_ws.unifiedMapUtils"]();
    const userPreferenceList = buildUserPrefWithAppId([relatedItemsExcludedCategoriesPrefName, 
        relatedItemsSortOrderPrefName], api.context.app.appId);
    if (event.elementId === 'related_items_prefs_cancel_button') {
        // close modal on cancel
        api.setState("relatedItemCategoriesAvailable", {});
        api.setState("relatedItemCategoriesSelected", []);
        helpers.modal.close('related_items_preferences_modal');
    } else if (event.elementId === 'related_items_prefs_apply_button') {
        // save new exclusion list on apply
        const newExclusionList = api.state.relatedItemExclusionList;
        api.data.save_user_prefs_related_items.execute({
            name: userPreferenceList[relatedItemsExcludedCategoriesPrefName],
            value: newExclusionList
        });
        api.data.save_user_prefs_related_items.execute({
            name: userPreferenceList[relatedItemsSortOrderPrefName],
            value: api.state.relatedItemSortOrderList
        });
        helpers.modal.close('related_items_preferences_modal');
    }
}
