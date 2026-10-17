function onContinue() { 
	var c = gel('sysparm_proceed');
    c.value = "true";
	g_form.save();
}

function cancel() {
    destroyDialog();
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
