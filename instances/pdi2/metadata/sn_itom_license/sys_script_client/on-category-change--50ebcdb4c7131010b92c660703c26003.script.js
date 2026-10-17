function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if (isLoading)
		return;
	
	if (newValue == '') {
		g_form.clearValue('category_table_name');
		g_form.setReadOnly('category_table_name',true);
		return;
	}

	g_form.clearValue('category_table_name');
	g_form.setReadOnly('category_table_name',true);
	
	var ga = new GlideAjax('ExcludeMetadataAjax');
	ga.addParam("sysparm_name", 'getParentTable'); 
	ga.addParam("sysparm_table_name", g_form.getValue('table_name'));
	ga.addParam("sysparm_category", newValue);
	ga.getXML(getResponse);
	
	function getResponse(response) {
		var res = response.responseXML.documentElement.getAttribute("answer");
		if(res) {
			g_form.setValue('category_table_name',res);
			g_form.setReadOnly('category_table_name',true);
		}
		else 
			g_form.addErrorMessage('No Related table in metadata found');		
	}   
}
