function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	var callback = function() {
		g_form.setValue("live_feed", true);
	};
	
	//Type appropriate comment here, and begin script below
	if (oldValue == "true"  && g_form.getValue("live_feed") == "false") {
		var dialog = new GlideDialogWindow('glide_confirm_standard');
		dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
		dialog.setPreference('warning', true);
		dialog.setPreference('title', new GwtMessage().getMessage("Turning off live feed will delete all live feed messages associated with this record group"));
		dialog.setPreference('onPromptCancel', callback.bind(this));
		dialog.render();
	}
}
