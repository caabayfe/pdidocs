function onLoad() {
	if (g_form.getValue('html_script_body') != '')
        return;
	
	var body = "${reported_date} ${target_user} ${template_script}";
    
   g_form.setValue('html_script_body', body);
}
