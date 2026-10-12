function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	
	if (newValue == "true" || newValue == true) {
		var dlg;
		dlg = new GlideDialogWindow('unreferenced_active_confirmation');
		dlg.setTitle(new GwtMessage().getMessage('Set Active Confirmation'));
		dlg.setWidth(550);
		dlg.render();
   }
}
