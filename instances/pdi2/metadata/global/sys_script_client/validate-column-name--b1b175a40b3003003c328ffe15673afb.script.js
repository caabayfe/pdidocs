function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
   var ga = new GlideAjax('ArticleTemplateUtil');
   ga.addParam('sysparm_name', 'validateColumnName');
   ga.addParam('column_name', newValue);	
   ga.addParam('article_template_id', g_form.getValue('article_template'));	
   ga.getXML(validateColumnName);	

   //Type appropriate comment here, and begin script below
   
}

function validateColumnName(xml){
	var answer = xml.responseXML.documentElement.getAttribute("answer");
	if(answer == 'nameExists'){
		g_form.showErrorBox('column_label', getMessage('A field with this name already exists in this template. Enter a different name.'), true); 
	}
	else if(answer == 'invalidName'){
		g_form.showErrorBox('column_label', getMessage('Enter a valid name with alphanumeric characters and underscore.'), true); 
	}
}
