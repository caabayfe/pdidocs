function ok() {
	proceedWithUpdateFromForm();
	return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
