var CreateUpdateSetDialog = Class.create({
	
	createUpdateSet:function () {
		var nameField = gel('update_set_name');
		var currentField = gel('make_current');
		var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
		ga.addParam('sysparm_function', 'createUpdateSet');
		ga.addParam('sysparm_name', nameField.value);
		ga.addParam('sysparm_current', currentField.checked);
		ga.addParam('sysparm_appid', '$[sysparm_sys_id]');
		ga.getXML(function (response) {	
			return false;
		});
		
		return true;
	}
});

var gCreateUpdateSetDialog = new CreateUpdateSetDialog();
$('create_update_set_dialog_container').observe('click',
function (event) {
	var elem = event.element();
	switch (elem.id) {
		case 'update_set_name':
		elem.focus();
		elem.select();
		break;
		case 'ok_button':
		if (gCreateUpdateSetDialog.createUpdateSet()) {
			GlideDialogWindow.get().destroy();
		}
                Event.stop(event);
		break;
		case 'cancel_button':
		GlideDialogWindow.get().destroy();
                Event.stop(event);
	}
}
);

$('create_update_set_dialog_container').observe('keyup',
function (event) {
	var elem = event.element();
	switch (event.keyCode) {
		case 13: // enter
		$('ok_button').click();
		break;
	}
}
);

var nameField = $('update_set_name');
nameField.focus();
nameField.select();
