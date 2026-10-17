function transform(input) {
    if (AssetWorkspaceUtil.isHAMActive()) {
		    return new sn_hamp.HAMAssetWorkspaceUtil().getModelManagementTabs();
    } else {
        return new AssetWorkspaceUtil().getModelManagementTabs();
    }
}
