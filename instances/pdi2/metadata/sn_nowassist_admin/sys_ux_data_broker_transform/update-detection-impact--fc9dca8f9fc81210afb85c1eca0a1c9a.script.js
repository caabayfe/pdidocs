function transform(input) {
    try {
        var grUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var metaUtil = new sn_nowassist_admin.NowAdminAssistMetadata();
        var skills = NAASkillConfigUtil.getSkillsOfProduct(input?.productId);
        var totalResult = [];
        totalResult.push(...grUtil.updateDetectionImpact(skills, input?.detectionImpact, metaUtil.NOW_ASSIST_GUARDIAN?.OFFENSIVENESS_TYPE));
        const success = totalResult.every(obj => obj.status === "success");
        return success;
    } catch (error) {
        gs.error("Error occurred while updating detection impact : " + error.toString());
    }
}
