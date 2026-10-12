function transform() {
    var assetWSUtils = new sn_itam_workspace.AssetWorkspaceUtil();
    var adjTyperesults = assetWSUtils.getRenwalCostAdjustmentTypes();
    var renewOptions = assetWSUtils.getRenewOptions();
    var details = {
        adjTypes: adjTyperesults,
        options: renewOptions,
    };
    return details;
}
