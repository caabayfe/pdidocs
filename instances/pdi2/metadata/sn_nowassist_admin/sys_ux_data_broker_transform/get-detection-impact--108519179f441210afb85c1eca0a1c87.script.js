function transform(input) {
    try {
        var grUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var metaUtil = new sn_nowassist_admin.NowAdminAssistMetadata();
        var skills = NAASkillConfigUtil.getSkillsOfProduct(input?.productId);
        return grUtil.getDetectionImpact(skills, metaUtil.NOW_ASSIST_GUARDIAN?.OFFENSIVENESS_TYPE);
    } catch (error) {
        gs.error("Error in getting detection Impact transform: " + error.toString());
    }
}
