(function executeRule(current, previous /*null when async*/ ) {

    var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(previous.descriptor);
    synchronizer.revokeUserPermissions(previous.user, previous.application);


})(current, previous);
