function transform(input) {
    skillConfigObj = JSON.parse(input.skillConfigObj);
    var extensions = new GlideScriptedExtensionPoint().getExtensions("sn_nowassist_admin.NowAssistAdminExtUtil");
    if (extensions && extensions.length > 0) {
        for (var i = 0; i < extensions.length; i++) {
            var extension = extensions[i];
            if (extension.hasMatchingCondition(skillConfigObj)) {
                // Get custom review implementation
                var reviewData = extension.getReviewPayload(skillConfigObj, input.payload);
                // Push Define access card Data only for skills not generated from NASK
                if (!skillConfigObj.isGeneratedFromSkillKit) {
                    reviewData.push(NAASkillConfigUtil.getReviewAccessCardData(skillConfigObj));
                }
                return reviewData;
            }
        }
    }
    //default implementation
    return NAASkillConfigUtil.getReviewPayload(skillConfigObj, input.payload);
}
