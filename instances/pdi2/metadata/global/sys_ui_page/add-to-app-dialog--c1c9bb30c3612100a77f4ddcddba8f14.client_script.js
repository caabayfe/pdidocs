var AddToAppDialog = Class.create({
	addToApp: function () {
		var select = gel('app_picker');
		var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
		ga.addParam('sysparm_function', 'addToApplication');
		ga.addParam('sysparm_sys_id', '$[sysIds]');
		ga.addParam('sysparm_sys_app', select.value);
		ga.addParam('sysparm_sys_table_name', '$[sysTableName]');
		ga.getXML(function (response) {
			GlideDialogWindow.get().destroy();
			location.reload();
		});
		return true;
	}
});

var gAddToAppDialog = new AddToAppDialog();
$('add_code_dialog_container').observe('click',
		function (event) {
			var elem = event.element();
			switch (elem.id) {
				case 'ok_button':
					gAddToAppDialog.addToApp();
					break;
				case 'cancel_button':
					GlideDialogWindow.get().destroy();
			}
		});

$('add_code_dialog_container').observe('keyup',
		function (event) {
			var elem = event.element();
			switch (event.keyCode) {
				case 13: // enter
					$('ok_button').click();
					break;
			}
		}
);

var selectList = gel('app_picker');
if (selectList === null) {
	$('ok_button').disabled = 'disabled';
	$('ok_button').hide();
} else {
	$('ok_button').focus();
}
