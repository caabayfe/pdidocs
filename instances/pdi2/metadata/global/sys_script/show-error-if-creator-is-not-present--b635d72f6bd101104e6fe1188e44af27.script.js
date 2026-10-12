(function executeRule(current, previous /*null when async*/ ) {
    var createdBy = current.getValue("sys_created_by");
    var creatorUser = gs.getUser().getUserByID(createdBy);
    if (gs.nil(creatorUser.getID())) {
        gs.addErrorMessage(gs.getMessage("The creator's access will be used to generate a model but we cannot find '{0}' in the user table. Please contact your system administrator to update the 'Created by' field.", createdBy));
    }
})(current, previous);
