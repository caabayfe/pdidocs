function transform(input) {
    var constants = {
        NOW_ASSIST_ITSM_PLUGIN: 'com.sn.itsm.gen.ai'
    };
    if (GlidePluginManager.isActive(constants.NOW_ASSIST_ITSM_PLUGIN))
        new sn_itsm_gen_ai.NowAssistItsmGenAIUtils().sendFeedback(input.logId, input.isResponseEdited, input.editedResponse, input.callerDetails);
}
