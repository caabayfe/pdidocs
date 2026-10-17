function ok() {       
    destroyDialog();
    g_form.setValue('retain_references', true);
    g_form.save();
	return true;
}
function cancel() {
	g_form.setValue('retain_references',false);
    destroyDialog();
	return false;
}
function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
