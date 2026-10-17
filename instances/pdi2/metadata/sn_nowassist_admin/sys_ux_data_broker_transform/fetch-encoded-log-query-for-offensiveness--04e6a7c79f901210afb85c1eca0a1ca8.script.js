function transform(input) {
    try {
        var guardUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var skillIdList = [];
        var features = NAAWorkFlowFeatureUtil.getFeatures(input?.productId);
        features.forEach(function(feature) {
            var skills = NAASkillConfigUtil.getSkills(feature.id);
            skills.forEach(function(skill) {
                skillIdList.push(skill.id);
            });
        });

        var url = guardUtil.getExportURL(skillIdList, guardUtil.OFFENSIVENESS_METRIC_NAME);
        return {
            path: url
        };
    } catch (error) {
        gs.error("Error occurred in fetching encoded log query for Offensiveness data broker : " + error.toString());
    }
}
