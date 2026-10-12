(function(context, pageParams, blockcontext) {
    // return some_output
    try {
        return NAARoleUtil.updateACLRolesForSkillConfig(blockcontext.selectedAclData);
    } catch (e) {
        gs.error("Failed to update ACL data- " + e.toString());
        throw new Error("Failed to update ACL data");
    }
})(context, pageParams, blockcontext);
