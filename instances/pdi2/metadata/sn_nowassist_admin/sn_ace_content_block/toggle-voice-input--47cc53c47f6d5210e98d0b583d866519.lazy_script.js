(function(context, pageParams, blockcontext) {

    var nacUtil = new sn_nowassist_admin.NowAssistConfig();
    // if toggle is already enabled then disable it and vice versa.
    if (blockcontext.isVoiceInputEnabled) {
        nacUtil.disableNowAssistPanelVoiceinput();
    } else {
        nacUtil.enableNowAssistPanelVoiceinput();
    }
})(context, pageParams, blockcontext);
