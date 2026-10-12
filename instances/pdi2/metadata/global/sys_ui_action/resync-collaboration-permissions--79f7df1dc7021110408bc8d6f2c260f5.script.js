var permissionSynchronizer = new global.AppCollabPermissionResynchronizer();
var appSysId = current.getUniqueValue();
permissionSynchronizer.syncCollaborators(true, appSysId);

permissionSynchronizer.logs.success.forEach(function (info) {
	gs.addInfoMessage(info.message + " " + info.link);
});

permissionSynchronizer.logs.error.forEach(function (info) {
	gs.addErrorMessage(info.message + " " + info.link);
});

if (
	permissionSynchronizer.logs.error.length === 0 &&
	permissionSynchronizer.logs.success.length === 0 ) {
	gs.addInfoMessage(gs.getMessage("Collaboration users and groups not found for this application"));
}

action.setRedirectURL(current);
