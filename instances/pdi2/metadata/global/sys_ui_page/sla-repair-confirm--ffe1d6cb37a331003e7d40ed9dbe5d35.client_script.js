function ok() {
    GlideDialogWindow.get().fireEvent('runRepair');
	return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();

    return false;
}
