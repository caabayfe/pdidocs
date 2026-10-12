(function executeRule(current, previous /*null when async*/ ) {

    var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(current.descriptor);
    synchronizer.syncCollaboratorPermissions();

})(current, previous);
