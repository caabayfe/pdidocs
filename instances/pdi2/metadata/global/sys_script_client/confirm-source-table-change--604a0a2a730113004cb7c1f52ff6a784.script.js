function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || !oldValue || newValue === oldValue || g_form.isNewRecord()) {
		return;
	}
		
	var dialog = new GlideModal('glide_modal_confirm', true, 300);
	dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
	dialog.setPreference('body', new GwtMessage().getMessage("Changing or removing Source Table will also remove Source Field value(s) at the question level.\nDo you want to continue?"));
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('onPromptCancel', doCancel);
	dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('OK'));
	dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('Cancel'));
	dialog.render();
	
	function doCancel() {
		g_form.setValue("source_table", oldValue);
	}
}
