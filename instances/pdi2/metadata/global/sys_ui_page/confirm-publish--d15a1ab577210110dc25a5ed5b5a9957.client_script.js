function publish_article(){
	closeDialogAndPublish();
	return true;
}

function cancel() {
	GlideDialogWindow.get().destroy();
	return false;
}
