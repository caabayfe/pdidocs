function cancel() {
	var c = gel('cancelled');
	c.value = "true";
	GlideDialogWindow.get().destroy();
}

function okHandler() {
	var stockroom = gel('alm_stockroom').value;
	var substatus = gel('substatus').value;

	if (stockroom == '') {
		alert(getMessage('Please select a stockroom'));
		return false;
	}

	var form = document.forms['form.' + '${sys_id}'];
	addInput(form, "HIDDEN", "stockroom", stockroom);
	return true;
}
