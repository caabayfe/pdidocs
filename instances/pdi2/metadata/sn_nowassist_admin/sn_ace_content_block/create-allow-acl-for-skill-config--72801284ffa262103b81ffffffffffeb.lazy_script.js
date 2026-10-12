(function(context, pageParams, blockcontext) {
    try {
        return NAARoleUtil.createACLForSkillConfig(blockcontext.skillId, blockcontext.selectedAclData);
    } catch (e) {
        gs.error("Failed to create ACL for skill config - " + e.toString());
        throw new Error("Failed to create ACL for skill config");
    }
})(context, pageParams, blockcontext);
