function transform(input) {
    if (gs.nil(input?.skillConfigId) || gs.nil(input?.state)) {
        return;
    }
    try {
        var result = false;
        var value = input?.state === "true";
        result = value ? NAASkillConfigUtil.toggleOnVAInNowAssist(input?.skillConfigId) : NAASkillConfigUtil.toggleOffVAInNowAssist(input?.skillConfigId);
        return result;
    } catch (e) {
        gs.error("Toggle va status failed: " + e.toString());
        return null;
    }
}
