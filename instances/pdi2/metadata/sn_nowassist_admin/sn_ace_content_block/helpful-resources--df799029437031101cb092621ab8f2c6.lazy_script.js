(function(context, pageParams, blockcontext) {
    // return some_output
    var resourceList = NAANowAssistPanelUtil.getHelpfulResourceForPanels();
    var voiceInputTooltipText = sn_i18n.Message.getMessage("sn_nowassist_admin", "You must turn on Now Assist Panel before you can enable voice input");
    var offText = sn_i18n.Message.getMessage("sn_nowassist_admin", "OFF");
    var onText = sn_i18n.Message.getMessage("sn_nowassist_admin", "ON");
    return {
        resources: resourceList,
        voiceInputTooltipText: voiceInputTooltipText,
        offText: offText,
        onText: onText
    };

})(context, pageParams, blockcontext);
