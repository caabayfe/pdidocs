function onSubmit() {
	this.appId = '$[sysparm_sys_id]';
	this.nameField = gel('app_name');
	this.descriptionField = gel('update_set_description');
	this.includeDataField = gel('includeCB');
	this.inferredUsName = this.nameField.value;

	var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
	ga.addParam('sysparm_function', 'createUpdateSet');
	ga.addParam('sysparm_name', nameField.value);
	ga.addParam('sysparm_appid', '$[sysparm_sys_id]');
	ga.addParam('sysparm_description', this.descriptionField.value);
	ga.addParam('sysparm_current', 'false');
	ga.getXML(function (response) {
		var setId = response.responseXML.documentElement.getAttribute("answer");
		publishApp(setId);
		return false;
	});
}

function publishApp(updateSetId) {
	var dd = new GlideModal("hierarchical_progress_viewer");
	dd.on("beforeclose", function () {
               var notification = {"getAttribute": function(name) {return 'true';}};
               CustomEvent.fireTop(GlideUI.UI_NOTIFICATION + '.update_set_change', notification);
               window.location.href = "sys_update_set.do?sys_id=" + updateSetId;
	});

	dd.setTitle("Progress");
	dd.setPreference('sysparm_function', 'publishToUpdateSet');
	dd.setPreference('sysparm_update_set_id', updateSetId);
	dd.setPreference('sysparm_sys_id', this.appId);
	dd.setPreference('sysparm_name', this.inferredUsName);
	dd.setPreference('sysparm_description', this.descriptionField.value);
	dd.setPreference('sysparm_include_data', "false");
	dd.setPreference('sysparm_progress_name', "Publishing application");
	dd.setPreference('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
	dd.setPreference('sysparm_show_done_button', 'true');

	dd.render();
	GlideDialogWindow.get().destroy();

	return dd;
}

function onCancel() {
	GlideDialogWindow.get().destroy();
}


$('publish_to_update_set_dialog_container').observe('click',
function (event) {
	var elem = event.element();
	if (elem.id == 'update_set_name') {
		elem.focus();
		elem.select();
	}
}
);

$('publish_to_update_set_dialog_container').observe('keyup',
function (event) {
	if (event.keyCode == 13)  // enter
		$('ok_button').click();
}
);
