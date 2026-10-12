function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!isLoading) {
		if (newValue) {
			var grAjax = new GlideAjax('TSConfigurationAjax');
			grAjax.addParam('sysparm_name', 'getColumns');
			grAjax.addParam('sysparm_table_name', newValue);
			grAjax.addParam('sysparm_ts_configuration', g_form.getValue('ts_configuration'));
			grAjax.addParam('sysparm_attribute_sys_id', g_form.getValue('name'));
			grAjax.getXML(function(response) {
				var columns = response.responseXML.documentElement.getAttribute("answer");
				columns = columns.split(',');
				g_form.clearOptions('column');
				for (var i = 0; i < columns.length; i++)
					g_form.addOption('column', columns[i], columns[i]);
			});			
		} else
			g_form.clearOptions('column');
	}
}
