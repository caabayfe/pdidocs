(function executeRule(current, previous /*null when async*/ ) {

    var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(previous.descriptor);
    synchronizer.revokeGroupPermissions(previous.group, previous.application);

})(current, previous);
