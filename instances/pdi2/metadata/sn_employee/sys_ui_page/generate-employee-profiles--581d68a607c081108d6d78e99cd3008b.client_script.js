function cancel() {
	var cancelledElement = gel('cancelled');
	cancelledElement.value = "true";
	GlideDialogWindow.get().destroy();
}

function proceed() {
	return true;
}
