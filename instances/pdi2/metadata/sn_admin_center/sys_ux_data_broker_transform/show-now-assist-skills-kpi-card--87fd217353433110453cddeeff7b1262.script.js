function transform() {
    var isBUPluginInstalled = false;
    try {
        const skillConfigUtil = new sn_nowassist_admin.NowAssistSkillConfig();
        if (skillConfigUtil.isBUPluginInstalled) {
            isBUPluginInstalled = skillConfigUtil.isBUPluginInstalled();
        } else {
            isBUPluginInstalled = GlidePluginManager.isActive('sn_genai_platform') || GlidePluginManager.isActive('sn_now_creator');
        }

    } catch (e) {
        gs.error('Failed to validate if BU plugin is installed');
    }
    return isBUPluginInstalled;



}
