function transform(input) {
    if (AssetWorkspaceUtil.isHAMActive()) {
		return new sn_hamp.HAMAssetWorkspaceUtil().getAssetEstateTabs();
    } else {
        return new AssetWorkspaceUtil().getAssetEstateTabs();
    }
}
