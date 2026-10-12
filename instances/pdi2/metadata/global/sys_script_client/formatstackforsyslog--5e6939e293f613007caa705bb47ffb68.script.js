(function () {
	// First check if the user has read access to a table
	var ga = new GlideAjax('CheckTableAccessForLogFormatting');
	ga.addParam('sysparm_name', 'hasReadAccess');
	ga.addParam('sysparm_table', 'syslog');
	ga.getXMLAnswer(function (response) {

		if (response == 'true' || response == true) {
			// User has read access, proceed to fetch and eval the script include
			var gr = new GlideRecord('sys_script_include');
			gr.addQuery('name', 'FormatStackForSyslog');
			gr.query(function () {
				if (gr.next()) {
					eval(gr.script);
					function refreshPage() {
						document.querySelectorAll('tr td').forEach(FormatStackForSyslog);
						setTimeout(refreshPage, 100);
					}
					refreshPage();
				}
			});


		} else {
			// No read access
		}
	});
})();

function onCellEdit() { }
