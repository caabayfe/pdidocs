function transform(input) {
	var filterConfig = {};
	var itemFilterMode = gs.getProperty('glide.sc.builder.item_filter_mode','default');
	filterConfig.itemFilterMode = itemFilterMode;
	if(itemFilterMode == 'owner_only')
		filterConfig.userMatchingSecondaryOwnerCriteria = sn_sc.CatItem.getMatchingSecondaryOwnerUCs();
	return filterConfig;
}
