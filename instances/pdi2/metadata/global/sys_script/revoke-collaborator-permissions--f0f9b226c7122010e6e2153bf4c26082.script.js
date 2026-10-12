(function executeRule(current, previous /*null when async*/) {

	var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(current.sys_id);
	synchronizer.revokeCollaboratorPermissions();

})(current, previous);
