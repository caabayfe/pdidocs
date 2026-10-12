(function(context, pageParams, blockcontext) {
    // return some_output
    var nacUtil = new sn_nowassist_admin.NowAssistConfig();
    var isEnabled = nacUtil.isNowAssistPanelEnabled();
    var disableNAP = NAANowAssistPanelUtil.disableTurnOnNAP();
    var hasNowAssistAdminUserRole = NAARoleUtil.isNAAReadOnlyUser();
    var llmContent = NAAWorkFlowFeatureUtil.getProvidersForFeature('nap');
    var disableTurnOff = false;
    var translatedDesc = gs.getMessage("Now Assist panel comes preconfigured as part of your license. Turn it on with default settings to give users the power of gen AI to your agents and creators.");
    var turnOnDescription = '<p>' + translatedDesc + '</p>';
    var turnOnFooterLabel = gs.getMessage("Note: Requires product plugin install");
    if (disableNAP) {
        var translation1 = gs.getMessage("Install at least one product plugin so that you can turn on Now Assist panel. ");
        var translation2 = gs.getMessage("View available plugins");
        turnOnDescription = "<p>" + translation1 + "<now-text-link label ='" + translation2 + "' href = 'now/now-assist-admin/plugins' / > < /p>";
    }
    if (hasNowAssistAdminUserRole) {
        disableTurnOff = true;
        turnOnFooterLabel = gs.getMessage("No access");
    }

    return {
        isEnabled: isEnabled,
        isDisabled: !isEnabled,
        disableNAP: disableNAP,
        turnOnDescription: turnOnDescription,
        turnOffSuccessMessage: sn_i18n.Message.getMessage("sn_nowassist_admin", "<span><strong>Turned off.</strong> The Now Assist panel and any additional settings are now turned off.</span>"),
        okButton: gs.getMessage("OK"),
        disableTurnOff: disableTurnOff,
        turnOnFooterLabel: turnOnFooterLabel,
        llm: llmContent.llm,
        llmTooltip: llmContent.llmTooltip,
        llmAriaConfig: llmContent.llmAriaConfig,
        isVoiceInputEnabled: nacUtil.isNowAssistPanelVoiceInputEnabled(),
        isNowAssistAdmin: !NAARoleUtil.isNAAReadOnlyUser(),
        turnOnVoiceInputSuccessMessage: sn_i18n.Message.getMessage("sn_nowassist_admin", "You can now use voice input in the Now Assist panel."),
        turnOffVoiceInputSuccessMessage: sn_i18n.Message.getMessage("sn_nowassist_admin", "Voice input is now turned off."),
        turnOffVoiceInputSuccessHeader: sn_i18n.Message.getMessage("sn_nowassist_admin", "Turned off."),
        turnOnVoiceInputSuccessHeader: sn_i18n.Message.getMessage("sn_nowassist_admin", "Turned on."),
        applicationsTranslated: sn_i18n.Message.getMessage("sn_nowassist_admin", "Applications"),
        nowAssistPanelTranslated: sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist panel")
    };

})(context, pageParams, blockcontext);
