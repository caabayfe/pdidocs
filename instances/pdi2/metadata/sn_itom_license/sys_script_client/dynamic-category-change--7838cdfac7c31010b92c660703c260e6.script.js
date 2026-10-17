function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
      return;
	}
	
	g_form.clearMessages();
	var ga = new GlideAjax('ExcludeMetadataAjax');
		ga.addParam("sysparm_name", 'getCategory'); 
		ga.addParam("sysparm_table_name", newValue);
		ga.getXML(getResponse);
	
	function getResponse(response) {		
		var res = response.responseXML.documentElement.getAttribute("answer");		
		var categories = JSON.parse(res);
		
		if(categories.length == 0) {
			g_form.addErrorMessage('No category found for selected table');
			g_form.clearOptions('category');
			g_form.clearValue('category');
			g_form.setReadOnly('category',true);
			g_form.clearValue('category_table_name');
			g_form.setReadOnly('category_table_name',true);
			
		} else if(categories.length == 1) {
			g_form.addOption('category', categories[0], categories[0]);
			g_form.setValue('category', categories[0], categories[0]);
			g_form.setReadOnly('category',true);
		} 
		else {
			categories.forEach(function(category){ g_form.addOption('category', category, category);});
			g_form.setValue('category', categories[0]);
			g_form.setReadOnly('category',false);
		}
			
	}
}
   
