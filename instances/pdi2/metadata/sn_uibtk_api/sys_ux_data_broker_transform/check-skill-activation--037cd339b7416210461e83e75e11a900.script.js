function transform(input) {
    var isGenAiControllerActive = GlidePluginManager.isActive('sn_generative_ai');

    if (input.skillConfigId) {
        var assistAdminHelper = new sn_nowassist_admin.NowAssistSkillConfig();
        var isActive = assistAdminHelper.isSkillConfigurationActive(input.skillConfigId);

        return isActive && isGenAiControllerActive;
    }

    return isGenAiControllerActive;
}
