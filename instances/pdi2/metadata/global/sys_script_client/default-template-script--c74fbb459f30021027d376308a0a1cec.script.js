function onLoad() {
   if (g_form.getValue('script') != '')
        return;

    var scriptTemplate = "(function runTemplateScript(current/*Current config*/, userPIIData /*User PII data*/, user /*Target user*/ ) {\r\n\r" +
		"\n\t//Add/Update your code changes here to return the dynamic content for template\r" +
		"\n\tuserPIIData = JSON.parse(userPIIData);" +
		"\n" +
		"\n\t// Styles" +
		"\n\tvar styles = {" +
			"\n\t\tfontFamily: 'arial, sans-serif'," +
			"\n\t\tborderColor: '#dddddd'," +
			"\n\t\tcellPadding: '8px'," +
			"\n\t\trowSeparationColor: '#dddddd'" +
		"\n\t};" +
		"\n" +
		"\n\tvar template = '<head><style>table {font-family: ' + styles.fontFamily + '; border-collapse: collpase; width: 100%;} td, th {border: 1px solid ' + styles.borderColor + '; text-align: left; padding: ' + styles.cellPadding + ';} tr:nth-child(even) {background-color: ' + styles.rowSeparationColor + ';}</style></head><body><div><br /><h3>Personal Data Stored: (classifications)</h3><hr />';" +
		"\n" +
		"\n\tfor(var data in userPIIData) {" +
			"\n\t\ttemplate += '<h4>' + userPIIData[data].dataClass + ':</h4>';" +
			"\n" +
			"\n\t\t//Add table data" +
			"\n\t\ttemplate += '<table>';" +
			"\n\t\tvar userData = userPIIData[data].userData;" +
			"\n" +
			"\n\t\tfor(var tableData in userData) {" +
				"\n\t\t\tfor(var i=0; i < userData[tableData].length; i++) {" +
					"\n\t\t\t\tvar label = userData[tableData][i].label;" +
					"\n\t\t\t\tvar value = userData[tableData][i].value;" +
					"\n\t\t\t\ttemplate += '<tr><td>' + label + '</td><td>' + value + '</td></tr>';" +
			"\n\t\t\t}" +
			"\n\t\t}" +
			"\n" +
			"\n\t\ttemplate += '</table><br />';" +
			"\n\t}" +
			"\n" +
			"\n\ttemplate += '</div></body>';" +
			"\n\treturn template; \r\n\r\n})(current, userPIIData, user);";

    g_form.setValue('script', scriptTemplate);
}
