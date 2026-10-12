function onProceed() { 
	var c = gel('sysparm_proceed');
	c.value = "true";
	g_form.save();
	destroyDialog();
}

function cancel() {
	var c = gel('sysparm_cancel');
	c.value =  "true";
	g_form.save();
	destroyDialog();
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
