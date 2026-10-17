function transform(input) {
    try {
        var guardrailsUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var CONSTANTS = new sn_nowassist_admin.NowAdminAssistMetadata();
        var NAA_GUARDIAN_CONSTANTS = CONSTANTS.NOW_ASSIST_GUARDIAN;
        var isPromptInjectionEnabled = false;
        var detectionImpact = "";

        var activeSkills = NAASkillConfigUtil.getAllActiveSkills();

        // if (!activeSkills.length) {
            var piControlSettingData = guardrailsUtil._getControlSettingDataByType(NAA_GUARDIAN_CONSTANTS.PROMPT_INJECTION_TYPE);
            detectionImpact = piControlSettingData && piControlSettingData["detectionImpact"];
        // } else {
        //     var detectionImpactPayload = guardrailsUtil.getDetectionImpact(activeSkills, NAA_GUARDIAN_CONSTANTS.PROMPT_INJECTION_TYPE);
        //     detectionImpact = detectionImpactPayload?.detectionImpact || "";

        // }
        if (detectionImpact === NAA_GUARDIAN_CONSTANTS.MONITOR || detectionImpact === NAA_GUARDIAN_CONSTANTS.BLOCK) {
            isPromptInjectionEnabled = true;
        }

    } catch (error) {
        gs.error("NowAssistAdminGuardrails : Error while fetching prompt injection enabled status: " + error.toString());
    }

    return {
        activeSkillsCount: activeSkills.length,
        isPromptInjectionEnabled: isPromptInjectionEnabled
    };
}
