function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === oldValue)
		return;

	var appName = g_form.getDisplayBox('table_ref.sys_scope').getAttribute('value');
	var appScope = g_form.getValue('app_scope');
	if (appScope == null || appScope.length == 0) 
		appScope = g_form.getReference('table_ref.sys_scope').scope;

	if (appScope === 'global' && appName === 'Global')
		return;

	var dialog = new GlideModal('glide_modal_info', true, 400);
	dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
	if (newValue == null || newValue.length == 0)
		dialog.setPreference('body', new GwtMessage().getMessage("All tables within Application {0} will have the associated subscription removed. All tables within the same application must be entitled to the same subscription unless they are mapped to a Grandfather subscription.", appName));
	else
		dialog.setPreference('body', new GwtMessage().getMessage("All tables within Application {0} will be entitled to {1}. All tables within the same application must be entitled to the same subscription unless they are mapped to a Grandfather subscription.",
			appName, g_form.getReference('subscription_entitlement').name));
	
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('buttonLabel', new GwtMessage().getMessage('OK'));
	dialog.render();

}
