function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var isWorkspaceAction = g_form.getValue('form_button_v2') === 'true' || g_form.getValue('form_menu_button_v2') === 'true';
   if (newValue === 'true' && !isWorkspaceAction) {
	   g_form.setValue('format_for_configurable_workspace', 'false');
	   g_form.showFieldMsg('format_for_configurable_workspace', 'Workspace Form Button or Menu selection required in order to be used in Configurable Workspace', 'info');
   }
   
}
