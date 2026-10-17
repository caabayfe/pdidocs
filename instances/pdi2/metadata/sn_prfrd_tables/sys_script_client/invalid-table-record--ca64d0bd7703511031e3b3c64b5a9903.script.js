function onLoad() {
	//Type appropriate comment here, and begin script below
	var tableName = g_form.getValue('table');
	if (tableName) {
		var ga = new GlideAjax('PreferredTableAjaxUtil');
		ga.addParam('sysparm_name', 'isValidTableRecord');
		ga.addParam('sysparm_table_name', tableName);
		ga.getXML(getResponse);
	}
}

function getResponse(serverResponse) {
	var result = serverResponse.responseXML.documentElement.getAttribute(
		'answer'
	) == 'false';
	if (result) {
		g_form.addInfoMessage(
			getMessage(
				'Table record does not exist.'
			)
		);
	}
}
