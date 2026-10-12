function addNewEntryPoint(button) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dlg = new dialogClass('sa_add_connection');
	dlg.setTitle(getMessage('Add Entry Point'));
	dlg.setWidth(600);
	dlg.render();
}
