function transform(input) {
    try {
        return NAARoleMaskingUtil.editRoleMaskingRolesForSkillAPI(input.payload.skillConfigId, input.payload.skillName, input.payload.roleMaskingList);
    } catch (e) {
        gs.error("Failed to update role masking data - " + e.toString());
        throw new Error("Failed to update role masking data for skill config");
    }
}
