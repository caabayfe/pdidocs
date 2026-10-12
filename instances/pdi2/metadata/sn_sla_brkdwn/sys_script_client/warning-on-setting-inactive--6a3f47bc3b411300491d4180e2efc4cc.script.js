var gFormAlreadySubmitted = false;

function onSubmit() {
	if (gFormAlreadySubmitted)
		return true;

	if (g_form.getValue("active") === "false" && g_form.modifiedFields.hasOwnProperty("sla_breakdown_definition.active")) {
		var ga = new GlideAjax('SLABreakdownDefinitionAJAX');
		ga.addParam('sysparm_name','activeBreakdownDataExists');
		ga.addParam('sysparm_breakdown_id', g_form.getUniqueValue());
		ga.getXMLAnswer(showConfirmSaveDialog);
		return false;
	}

	return true;
}

function showConfirmSaveDialog(showDialog) {
	if (showDialog !== "true") {
		save();
		return;
	}

    var dialog = new GlideModal("glide_ask_standard");
    dialog.setTitle(new GwtMessage().getMessage("De-activating breakdown definition"));
    dialog.setPreference("warning", true);
    dialog.setPreference("title", new GwtMessage().getMessage("Deactivating this breakdown definition will delete any breakdown data that is related to Task SLAs that are still active. Do you want to continue?"));
    dialog.setPreference('onPromptComplete', save.bind(this));
    dialog.setPreference('onPromptCancel', function(){});
	dialog.setPreference('focusTrap', true);
    dialog.render();
}

function save() {
	gFormAlreadySubmitted = true;
	gsftSubmit(undefined, undefined, g_form.getActionName());
}
