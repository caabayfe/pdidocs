function cancel() {
	GlideDialogWindow.get().destroy();
}

function actionOK() {
	var c = gel('selection_result');
    c.value = 'close';
	
	return true;
}
