function onCondition() {
	if (g_form.getValue('short_description')!=''){
		var short_desc = g_form.getValue('short_description');
		var new_desc = short_desc +"\n"+ g_form.getValue('description');
	
		g_form.setValue('short_description','');
		g_form.setValue('description',new_desc);
	}
}
