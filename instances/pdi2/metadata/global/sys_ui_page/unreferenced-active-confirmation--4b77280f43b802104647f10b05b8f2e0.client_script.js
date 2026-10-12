function ok() {       
    destroyDialog();
    g_form.setValue('active', true);
	return true;
}
function cancel() {
	g_form.setValue('active',false);
    destroyDialog();
	return false;
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
