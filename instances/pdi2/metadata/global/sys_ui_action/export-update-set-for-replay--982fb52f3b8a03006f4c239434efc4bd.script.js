function CreateLocalRunUpdateSet() {
	var ga, sysIds,
		name = 'ecc_queue';

	// Figure out what record(s) to export and what to name the update set.
	if (typeof g_form != 'undefined') {
		name = g_form.getUniqueValue();
		sysIds = g_form.getUniqueValue();
	}
	if (typeof g_list != 'undefined')
		sysIds = g_list.getChecked();

	// Create the XML for an update set
	ga = new GlideAjax('DUpdatesetAjax');
	ga.addParam('sysparm_name', 'getUpdateSet');
	ga.addParam('sysparm_ecc_sys_id', sysIds);
	ga.addParam('sysparm_updateset_name', name);

	ga.getXML(function(queryResponse) {
		var answer, url = new GlideURL('export_update_set.do'),
			frame = top.gsft_main || top;

		answer = queryResponse.responseXML.documentElement.getAttribute('answer');
		answer = JSON.parse(answer);

		// Show any messages
		answer.msgs.forEach(function(msg) { if (typeof g_form != 'undefined') g_form.addInfoMessage(msg); });

		if (answer.exportSysId) {
			// Download the xml file on the machine
			url.addParam('sysparm_sys_id', answer.exportSysId);
			frame.location = url.getURL();

			// Delete the update set
			var ga = new GlideAjax('DUpdatesetAjax');
			ga.addParam('sysparm_name', 'deleteUpdateSet');
			ga.addParam('sysparm_updateset_name', name);
			ga.addParam('sysparm_updateset_sysid', answer.exportSysId);

			// If we don't have g_form then we don't have g_form.addInfoMessage.  Send the
			// messages back to the server and let that script display them.
			if (typeof g_form == 'undefined')
				ga.addParam('sysparm_messages', answer.msgs);

			ga.getXML(function() { });
		}
	});
}
