function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	g_form.getReference('todo_config', getConfig);

    function getConfig(response) { 
		g_form.setValue('table',response.getValue('table'));
    }
   
}
