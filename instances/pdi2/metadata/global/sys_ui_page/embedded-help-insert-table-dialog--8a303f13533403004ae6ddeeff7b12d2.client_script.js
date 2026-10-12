function onSubmit() {
	var row = gel('number').value;
	var param;
	var action;
	
	if(!isEmpty(row) && (row > 0 && row < 25)) {
		param = {
			"rows": row
		};
		action = GlideDialogWindow.get().getPreference('action');
		action(param);
		
	} else
		toggleError();
}

function toggleError() {
	document.getElementById('error-msg').style.visibility = 'visible';
}

function isEmpty(item) {
	return item === "" || item === undefined || item === null;
}
