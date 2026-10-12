(function(context, pageParams, blockcontext) {
    var nacUtil = new sn_nowassist_admin.NowAssistConfig();
    var isNAPEnabled = nacUtil.isNowAssistPanelEnabled();
    var description = gs.getMessage("Your plugin was successfully installed");
    var buttonLabel = "";
    var url = "now/now-assist-admin/plugins/params/workflow/"+blockcontext.AvailablePluginsSelectedFilterItem;
    var isPluginActive = GlidePluginManager.isActive(blockcontext.PluginID);
    if (isPluginActive) {
        if (isNAPEnabled) {
            description = gs.getMessage("Set up and configure new Now Assist Admin skills.");
            buttonLabel = gs.getMessage("Go to Now Assist skills");
            url = NAAPluginUtil.getFeaturePageUrl(blockcontext.PluginID);
        } else {
            description = gs.getMessage("Turn on Now Assist panel to activate new skills.");
            buttonLabel = gs.getMessage("Go to Now Assist panel");
            url = "now/now-assist-admin/now-assist-panel";
        }
    }
    return {
        description: description,
        buttonLabel: buttonLabel,
        url: url,
        isPluginInstalled: isPluginActive,
        isNAPEnabled: isNAPEnabled
    };

})(context, pageParams, blockcontext);
