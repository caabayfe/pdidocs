(function(context, pageParams, blockcontext) {
    // return some_output
    // This data content block is not in use as there are no roles as of now.
    var turnOnbuttonLabel = gs.getMessage("Turn on");
    // if (blockcontext.isPanelEnabled) {
    //     turnOnbuttonLabel = gs.getMessage("Save");
    // }
    // var nacUtil = new sn_nowassist_admin.NowAssistConfig();
    // var selectedUserRoles = nacUtil.getNAPRoles();
    // var targetSelectedUserRoles = selectedUserRoles.map(p => ({
    //     "id": p,
    //     "label": p
    // }));
    // //get all user roles
    // var allUserRoles = nacUtil.getAllUserRoles();
    return {
        // userRoles: targetSelectedUserRoles,
        // allUserRoles: allUserRoles,
        turnOnbuttonLabel: turnOnbuttonLabel
    };

})(context, pageParams, blockcontext);
