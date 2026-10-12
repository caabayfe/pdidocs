function transform(input) {
    try {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
        var value = input?.state === "true" ? true : (input?.state === "false" ? false : "");
        if (!gs.nil(value)) {
            var result = util.updateNacmDetailsForSkillConfig(input?.skillConfigId, value);
        }
    } catch (e) {
        gs.error("Toggle nacm display failed: " + e.toString());
    }
}
