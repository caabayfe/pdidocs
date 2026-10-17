function cancel() {
	var c = gel('cancelled');
	c.value = "true";
	GlideDialogWindow.get().destroy();
}

function onSubmit() {
	var sys_db_object = trim(gel('sys_db_object').value);
	if ('' == sys_db_object) {
		alert(getMessage("Please specify Table"));
		return false;
	}
	return true;
}
