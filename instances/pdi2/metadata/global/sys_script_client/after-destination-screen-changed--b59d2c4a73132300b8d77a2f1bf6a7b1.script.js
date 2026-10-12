function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	var listGR = new GlideRecord('sys_sg_list_screen');
	listGR.get(newValue);
	
	g_form.setValue('title', listGR.getValue('name'));
}
