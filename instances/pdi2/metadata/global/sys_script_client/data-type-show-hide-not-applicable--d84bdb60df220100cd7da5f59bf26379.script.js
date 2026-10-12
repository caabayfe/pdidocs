function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == 'percentage' || newValue == 'long' || newValue == 'ranking' || newValue == 'string' || newValue == 'attachment' || newValue == 'date' || newValue == 'datetime' || newValue == 'checkbox' || newValue == 'imagescale' || newValue == 'multiplecheckbox') {
		g_form.setValue('allow_not_applicable', false);
		g_form.setVisible('allow_not_applicable', false);
	}
	else if(newValue == 'template')
	{
		var ga= new GlideAjax('AssessmentUtilsAJAX');
		ga.addParam('sysparm_name','checkAllowImage');
		ga.addParam('templateID',String(g_form.getValue('template')));
		ga.getXML(checkAllowImage);	
	}
	else if (g_form.getValue('method') != 'script'){
		g_form.setVisible('allow_not_applicable', true);
	}
	
	function checkAllowImage(response)
	{
		var allowImageExists = response.responseXML.documentElement.getAttribute("answer");
		if(allowImageExists == 1){
		   g_form.setVisible('allow_not_applicable',false);	
		   g_form.setValue('allow_not_applicable',false);		
		}
		else
		{
		   g_form.setVisible('allow_not_applicable',true);		
		}
	}
}
