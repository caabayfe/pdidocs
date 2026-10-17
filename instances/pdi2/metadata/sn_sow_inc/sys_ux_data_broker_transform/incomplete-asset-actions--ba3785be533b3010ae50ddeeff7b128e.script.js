function transform(input) {
	var hasIncompleteAssetActions = false;
	if(GlidePluginManager.isActive("com.sn_hamp")) {
		var gr = new GlideRecord("incident");
		if(gr.get(input.sysId)) {
			var itsmCommonHAM = new global.ITSMCommonHAM(gr);
			hasIncompleteAssetActions = itsmCommonHAM.hasEmptyAssetAction() || itsmCommonHAM.isSwappedCIEmpty();
		}
	}
	return {
		hasIncompleteAssetActions: hasIncompleteAssetActions
	};
}
