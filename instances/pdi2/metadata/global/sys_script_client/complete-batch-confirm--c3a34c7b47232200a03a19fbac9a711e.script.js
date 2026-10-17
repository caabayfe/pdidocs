function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue !== 'complete') {
		return;
	}
	
	if (g_scratchpad.base_update_set_id == "")
		return;
	
	if (g_scratchpad.base_update_set_id != g_form.getUniqueValue())
		return;
	
	var dialog = new GlideModal('glide_modal_confirm', true, 300);
	dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
	dialog.setPreference('body', new GwtMessage().format("This will complete all update sets in the batch. Continue changing state to complete?"));
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('onPromptCancel', doCancel);
	dialog.render();
	
	function doCancel() {
		g_form.setValue("state", oldValue);
	}
}
