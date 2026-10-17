(function executeRule(current, previous /*null when async*/ ) {

    var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(current.descriptor);
    synchronizer.syncGroupPermissions(current.group, current.application);

})(current, previous);
