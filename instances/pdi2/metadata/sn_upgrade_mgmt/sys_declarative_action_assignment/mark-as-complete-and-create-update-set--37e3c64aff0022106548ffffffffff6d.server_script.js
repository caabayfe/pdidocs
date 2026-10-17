try {
	new global.UpgradeManagementApiUtil().createUpdateSet();
	current.state = "COMPLETE";
	current.update();
} catch(e) {
	gs.error(e);
}
