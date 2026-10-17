(function(context, pageParams, blockcontext) {
    try {
        var roleMaskingData = {...blockcontext.roleMaskingList};
        return NAARoleMaskingUtil.editRoleMaskingRolesForSkillAPI(blockcontext.skillId, blockcontext.edit_access_skill_data.skillName, roleMaskingData);
    } catch (error) {
        gs.error("Error while editing role masking records for skill config: " + error.toString());
    }
})(context, pageParams, blockcontext);
