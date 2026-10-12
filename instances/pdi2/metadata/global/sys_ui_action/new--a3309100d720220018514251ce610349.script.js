function showUpgradeDialog() {
	var gDialog = new GlideDialogWindow('pa_upgrade_dialog');
	gDialog.setTitle(new GwtMessage().getMessage('pa_upgrade_dialog_title'));
	gDialog.setWidth(500);
	gDialog.render();
}
