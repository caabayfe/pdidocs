function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var scriptName = g_form.getReference('mid_server_script_include').name;
	if (!scriptName.startsWith("TransformEvents_")) {
		alert(new GwtMessage().getMessage("Script name must start with 'TransformEvents_'"));
		g_form.setValue('header_name', '');
		g_form.setValue('header_value', '');
		g_form.setDisplay('mid_server_script_include.script', false);
	} else {
		g_form.setValue('header_name', 'Transform');
		g_form.setValue('header_value', scriptName);
		g_form.setDisplay('mid_server_script_include.script', true);
	}
   
}
