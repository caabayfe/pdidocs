function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
   if (newValue === '') {
      return;
   }
	
   var dataType = g_form.getValue('datatype');
   if(dataType != 'template')
      return;
	
	var ga= new GlideAjax('AssessmentUtilsAJAX');
	ga.addParam('sysparm_name','checkAllowImage');
	ga.addParam('templateID',String(newValue));
	ga.getXML(checkAllowImage);	
   //Type appropriate comment here, and begin script below  
}

function checkAllowImage(response)
	{

		var allowImageExists = response.responseXML.documentElement.getAttribute("answer");
		if(allowImageExists == 1){
		g_form.setValue('allow_not_applicable',false);			
		g_form.setVisible('allow_not_applicable',false);	
		}
		else
		{
		g_form.setVisible('allow_not_applicable',true);		
		}
	}
