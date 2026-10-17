function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	var gr = new GlideRecord('sys_sg_data_item');
	if(gr.get(g_form.getValue("data_item")))
		g_form.setValue("data_item_table", gr.getValue('table'));	
}
