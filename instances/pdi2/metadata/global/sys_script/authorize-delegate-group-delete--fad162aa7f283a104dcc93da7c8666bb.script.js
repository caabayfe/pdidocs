(function executeRule(current, previous /*null when async*/ ) {
    var utils = new global.SPMUtilsFactory().getUtils();
    if (!utils.canCurrentUserManageDelegate(current)) {
        gs.addErrorMessage(gs.getMessage('You are not authorized to manage delegates for this CI.'));
        current.setAbortAction(true);
    }

})(current, previous);
