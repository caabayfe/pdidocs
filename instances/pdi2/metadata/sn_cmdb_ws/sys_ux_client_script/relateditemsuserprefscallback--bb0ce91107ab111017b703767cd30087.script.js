function script({ api, event, helpers, imports }) {
    const { relatedItemsExcludedCategoriesPrefName, relatedItemsSortOrderPrefName, buildUserPrefWithAppId } = imports["sn_cmdb_ws.unifiedMapUtils"]();
    const userPreferenceList = buildUserPrefWithAppId([relatedItemsExcludedCategoriesPrefName, relatedItemsSortOrderPrefName], api.context.app.appId);
    let prefs = api.data.get_user_prefs_related_items.output;
    if (!prefs || !Object.keys(prefs).length) {
        prefs = "";
    }
    api.setState("relatedItemExclusionList", prefs[userPreferenceList[relatedItemsExcludedCategoriesPrefName]]);
    api.setState("relatedItemSortOrderList", prefs[userPreferenceList[relatedItemsSortOrderPrefName]]);
}
