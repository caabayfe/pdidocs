function transform(input) {

    var filterId = input.filterId;
    try {
        if (gs.nil(filterId)) {
            return null;
        }
        var isConversationalStudioInstalled = false;
        var nowAssistGuardianFilterUtil = new sn_nowassist_admin.NowAssistGuardianFilterUtil();
        isConversationalStudioInstalled = new GlidePluginManager().isActive('com.sn_conversational_studio');
        return {
                filterDetails: nowAssistGuardianFilterUtil.getGenAIFilterByFilterId(filterId),
                cbTopicId : nowAssistGuardianFilterUtil.getFilterCbTopicId(filterId),
                isConversationalStudioInstalled: isConversationalStudioInstalled
        };
    } catch (e) {
        gs.error("Failed fetch Sensitive Filter - " + e.toString());
        return null;
    }

}
