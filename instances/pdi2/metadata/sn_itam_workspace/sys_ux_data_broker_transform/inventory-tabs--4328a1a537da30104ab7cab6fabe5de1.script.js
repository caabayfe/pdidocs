function transform(input) {
    if (AssetWorkspaceUtil.isHAMActive() && sn_hamp.HAMAssetWorkspaceUtil && sn_hamp.HAMAssetWorkspaceUtil.prototype.getInventoryTabs) {
        return new sn_hamp.HAMAssetWorkspaceUtil().getInventoryTabs();
    } else {
        return new AssetWorkspaceUtil().getInventoryTabs();
    }
}
