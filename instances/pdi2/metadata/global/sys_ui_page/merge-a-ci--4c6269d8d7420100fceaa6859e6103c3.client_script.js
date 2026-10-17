function cancel() {
	var c = gel('cancelled');
	c.value = "true";
	GlideDialogWindow.get().destroy();
}

function actionOK() {
	var ci_id = gel('QUERY:unverified=false^ORunverifiedISEMPTY').value;
	
	if (ci_id == '') {
		alert(getMessage("Please select a CI to merge this CI into"));
		return false;
	} else {
		var form = document.forms['form.' + '${sys_id}'];
		addInput(form, "HIDDEN", "new_ci", ci_id);
		return true;
	}
}
