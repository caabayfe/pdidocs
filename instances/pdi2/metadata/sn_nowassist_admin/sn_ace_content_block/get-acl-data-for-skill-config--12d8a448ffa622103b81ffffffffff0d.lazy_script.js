(function(context, pageParams, blockcontext) {
    // return some_output
    var result = NAASkillAclUtil.getSkillAclData(blockcontext.skillId);
    if (result?.columnDefinitions?.columns.length > 4)
        result.columnDefinitions.columns = result.columnDefinitions.columns.slice(0, -2);
    result.selectRolesRadioSelected = !result.rolesList.includes("any");
    return result;
})(context, pageParams, blockcontext);
