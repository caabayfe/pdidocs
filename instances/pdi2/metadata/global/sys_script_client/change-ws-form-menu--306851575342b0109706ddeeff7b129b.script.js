function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (newValue==='true') {
	   if (g_form.isNewRecord()) {
		   g_form.setValue('format_for_configurable_workspace', 'true');
		   g_form.setReadOnly('format_for_configurable_workspace', false);
	   }
   }
	
   var isWorkspaceButton = g_form.getValue('form_button_v2') === 'true';
   if (isWorkspaceButton) return;
	
   var isFormatConfigurationWorkspace = g_form.getValue('format_for_configurable_workspace') === 'true';
   if (!isFormatConfigurationWorkspace) return;

   if (newValue==='false') {
	   g_form.setValue('format_for_configurable_workspace', 'false');
	   g_form.setReadOnly('format_for_configurable_workspace', false);
	   g_form.showFieldMsg('format_for_configurable_workspace', 'Workspace Form Button or Menu selection required in order to be used in Configurable Workspace', 'info');
   } 
}
