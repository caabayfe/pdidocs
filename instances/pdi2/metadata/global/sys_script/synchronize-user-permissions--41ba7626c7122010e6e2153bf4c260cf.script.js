(function executeRule(current, previous /*null when async*/ ) {

    var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(current.descriptor);
    synchronizer.syncUserPermissions(current.user, current.application);

})(current, previous);
