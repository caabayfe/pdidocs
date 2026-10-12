function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var ga = new GlideAjax('AJAXListDefaultColumns');
	ga.addParam('tableName', newValue);
	ga.addParam('sysparm_function', 'getColumns');
	ga.addParam('sysparm_name', 'getColumns');
	ga.getXMLAnswer(function(response) {
		var columns = response.slice(1, -1).split(',').map(function(item) {return item.trim();}).join(',');
		g_form.setValue('columns', columns);
	});
}
