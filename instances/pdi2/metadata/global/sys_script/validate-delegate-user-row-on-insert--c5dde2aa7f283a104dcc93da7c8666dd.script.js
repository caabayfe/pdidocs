(function executeRule(current /*, previous */ ) {
    var utils = new global.SPMUtilsFactory().getUtils();
    if (!utils.canCurrentUserManageDelegate(current)) {
        gs.addErrorMessage(gs.getMessage('You are not authorized to manage delegates for this CI.'));
        current.setAbortAction(true);
        return;
    }

    var validation = utils.validateDelegateUser(current);

    if (!validation || validation.isValid === false) {
        if (validation && validation.message) {
            gs.addErrorMessage(validation.message);
        }
        current.setAbortAction(true);
        return;
    }

})(current);
