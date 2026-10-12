function transform(input) {
    try {
        var guardrailsUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var CONSTANTS = new sn_nowassist_admin.NowAdminAssistMetadata();
        var NAA_GUARDIAN_CONSTANTS = CONSTANTS.NOW_ASSIST_GUARDIAN;
        var detectionImpact = "";
        var piControlSettingData = guardrailsUtil._getControlSettingDataByType(NAA_GUARDIAN_CONSTANTS.PROMPT_INJECTION_TYPE);
        detectionImpact = piControlSettingData && piControlSettingData["detectionImpact"];
    } catch (error) {
        gs.error("Unable to get detection impact for prompt injection: " + error.toString());
    }
    return detectionImpact;
}
