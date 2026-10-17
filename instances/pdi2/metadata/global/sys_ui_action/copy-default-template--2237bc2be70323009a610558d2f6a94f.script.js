function onClick() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('select_model_category');
	gDialog.setTitle('Select Model Category');
	gDialog.render();
}
