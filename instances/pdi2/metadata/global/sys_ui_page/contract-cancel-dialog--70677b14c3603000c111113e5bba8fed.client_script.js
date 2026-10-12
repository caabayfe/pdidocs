function cancel() {
	var c = gel('selection_result');
    c.value = 'go_back';
	GlideDialogWindow.get().destroy();
	return false;
}

function actionOK() {
	var c = gel('selection_result');
    c.value = 'cancel';
	
	return true;
}
