(function executeRule(current, previous /*null when async*/ ) {

    var runAsUser = gs.getUser().getUserByID(current.run_as);

    if (runAsUser.hasRole('admin') && !gs.hasRole('admin')) {
        var errMsg = gs.getMessage('Cannot set the Run as field to an admin user as a non-admin user');
        gs.error(errMsg);
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    } else if (runAsUser.hasRole('system_scheduler_admin') && !gs.hasRole('system_scheduler_admin')) {
        var errMsg = gs.getMessage('Cannot set the Run as field to system_scheduler_admin user as a non system_scheduler_admin user');
        gs.error(errMsg);
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }

})(current, previous);
