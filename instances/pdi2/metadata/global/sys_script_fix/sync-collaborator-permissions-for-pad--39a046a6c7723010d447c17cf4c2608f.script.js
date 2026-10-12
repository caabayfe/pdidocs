(function () {
	var ownerDescriptorId = '8b0cbfc2c7132010d447c17cf4c26053';
	var ownerSynchronizer = new sn_appcollab.CollabPermissionSynchronizer(ownerDescriptorId);
	ownerSynchronizer.syncCollaboratorPermissions();

	var editorDescriptorId = '3bb75c9ec7132010d447c17cf4c2605a';
	var editorSynchronizer = new sn_appcollab.CollabPermissionSynchronizer(editorDescriptorId);
	editorSynchronizer.syncCollaboratorPermissions();
})();
