gs.log("App Collaborator Permissions Resync - START");
var synchronizer = new AppCollabPermissionResynchronizer();
var message = { message: "App Collaborator Permissions Resync - FAILED" };

try {
	synchronizer.syncCollaborators(true);
} catch (error) {
	message.exception = error;
	gs.log(JSON.stringify(message));
}
