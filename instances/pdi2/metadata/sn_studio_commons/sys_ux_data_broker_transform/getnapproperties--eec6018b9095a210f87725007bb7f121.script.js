function transform() {
    const APP_GEN_PLUGIN = "sn_ae_gen_ai";
    const BUILD_AGENT_PLUGIN = "sn_build_agent";
    const APP_GEN_SKILL_CONFIG = "9911347fc36c0210a586e548fa40dd49";

    const napAccessStatus = {
        isNowAssistInstalled: false,
        isNowAssistEnabled: false,
        isAppGenInstalled: false,
        isAppGenSkillActive: false,
        hasRequiredRoles: false,
    };

    const baAccessStatus = {
        isBuildAgentInstalled: false,
    };

    try {
        const UDC = sn_udc.UDCGenAIUtils;

        napAccessStatus.isNowAssistInstalled = UDC.isGenAIPluginActive();
        napAccessStatus.isNowAssistEnabled = UDC.canUserUseNAP();
        napAccessStatus.isAppGenInstalled = UDC.isPluginActive(APP_GEN_PLUGIN);
        napAccessStatus.isAppGenSkillActive = UDC.isSkillActive(APP_GEN_PLUGIN, APP_GEN_SKILL_CONFIG);

        // Check roles only if NAP and AppGen are active
        if (napAccessStatus.isAppGenInstalled && UDC.isPanelEnabled()) {
            napConfig = UDC.getAppGenNAPConfig();
            napAccessStatus.hasRequiredRoles = napConfig?.userCanUseNowAssist === true;
        }

        // Update build agent plugin status
        baAccessStatus.isBuildAgentInstalled = UDC.isPluginActive(BUILD_AGENT_PLUGIN);

    } catch (e) {
        gs.error(`Error while fetching NAP properties: ${e.message}`);
    }

    return {
        napAccessStatus,
        baAccessStatus,
    };
}
