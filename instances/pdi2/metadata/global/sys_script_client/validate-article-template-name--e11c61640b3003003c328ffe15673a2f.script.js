function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var ga = new GlideAjax('ArticleTemplateUtil');
   ga.addParam('sysparm_name', 'validateATName');
   ga.addParam('article_template', newValue);
   ga.getXML(validateAT);	

   //Type appropriate comment here, and begin script below
   
}

function validateAT(xml){
	var answer = xml.responseXML.documentElement.getAttribute("answer");
	if(answer == 'nameExists'){
		g_form.showErrorBox('article_template', getMessage('An article template with the same name already exists. Enter a different name.'), true); 
	}
	else if(answer == 'invalidName'){
		g_form.showErrorBox('article_template', getMessage('Enter a valid name with alphanumeric characters and underscore.'), true); 
	}
}
