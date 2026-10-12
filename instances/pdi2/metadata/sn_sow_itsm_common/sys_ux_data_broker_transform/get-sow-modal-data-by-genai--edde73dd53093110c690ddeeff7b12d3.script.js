function transform(input) {
    var constants = {
        NOW_ASSIST_ITSM_PLUGIN: 'com.sn.itsm.gen.ai'
    };
    if (!GlidePluginManager.isActive(constants.NOW_ASSIST_ITSM_PLUGIN))
        return null;
    return new sn_itsm_gen_ai.NowAssistItsmGenAIUtils().fetchModalDataByGenAI(input.table, input.sysId, input.view);
}
