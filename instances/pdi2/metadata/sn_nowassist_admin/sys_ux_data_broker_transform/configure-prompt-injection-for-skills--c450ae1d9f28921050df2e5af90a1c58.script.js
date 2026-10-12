function transform(input) {
    var detectionImpact = input.detectionImpact;
    if (gs.nil(detectionImpact)) {
        return;
    }

    var isUpdated = false;

    try {
        // var naaUtil = new sn_nowassist_admin.NowAdminAssistUtil();
        var guardrailsUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var CONSTANTS = new sn_nowassist_admin.NowAdminAssistMetadata();
        var NAA_GUARDIAN_CONSTANTS = CONSTANTS.NOW_ASSIST_GUARDIAN;

        // var controlSettingDataGr = new GlideRecord('sys_gen_ai_control_setting_data');
        // controlSettingDataGr.addQuery("control_setting.name", NAA_GUARDIAN_CONSTANTS.PROMPT_INJECTION_TYPE);
        // controlSettingDataGr.query();

        // var skills = [];
        // if (controlSettingDataGr.hasNext()) {
        //     while (controlSettingDataGr.next()) {
        //         var skillConfigId = controlSettingDataGr?.control_data?.target?.toString();
        //         skills.push({ id: skillConfigId });
        //     }
        // } else {
        //     skills = naaUtil.getAllActiveSkills();
        // }

        // var result = guardrailsUtil.updateDetectionImpact(skills, detectionImpact, NAA_GUARDIAN_CONSTANTS.PROMPT_INJECTION_TYPE);
        var result = guardrailsUtil.updateDetectionImpactForPromptInjection(detectionImpact);

        //Check if the detection impact is Updated
        var piControlSettingData = guardrailsUtil._getControlSettingDataByType(NAA_GUARDIAN_CONSTANTS.PROMPT_INJECTION_TYPE);
        var newDetectionImpact = piControlSettingData && piControlSettingData["detectionImpact"];

        if (newDetectionImpact === detectionImpact) {
            isUpdated = true;
        } else {
            gs.error("Failed to update detection impact.");
        }

    } catch (error) {
        gs.error("Error updating detection impact: " + error.toString());
    }

    return isUpdated;
}
