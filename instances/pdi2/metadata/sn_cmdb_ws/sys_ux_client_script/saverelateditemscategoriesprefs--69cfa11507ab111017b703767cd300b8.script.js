function script({ api, event, helpers, imports }) {
	const { relatedItemsExcludedCategoriesPrefName, relatedItemsSortOrderPrefName, buildUserPrefWithAppId } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const userPreferenceList = buildUserPrefWithAppId([relatedItemsExcludedCategoriesPrefName, relatedItemsSortOrderPrefName], api.context.app.appId);
	const newExclusionList = api.state.relatedItemExclusionList;
	const newSortOrder = api.state.relatedItemSortOrderList;

	api.data.save_user_prefs_related_items.execute({
		name: userPreferenceList[relatedItemsExcludedCategoriesPrefName],
		value: newExclusionList
	});

	api.data.save_user_prefs_related_items.execute({
		name: userPreferenceList[relatedItemsSortOrderPrefName],
		value: newSortOrder
	});

}
