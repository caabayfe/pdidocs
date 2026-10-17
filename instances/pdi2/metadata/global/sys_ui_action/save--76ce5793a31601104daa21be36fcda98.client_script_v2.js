function onClick(g_form) {
	var docVersionSysId = g_form.getUniqueValue();
	
	if(g_form.getValue('type') == 'attachment') {
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_sys_id', docVersionSysId);
		gr.query(checkIfAttachmentExists);
	} 
	else if(g_form.getValue('type') == 'url') {
		var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		var url = g_form.getValue('url');
		if (!regex.test(url)) {
			g_form.addErrorMessage(getMessage('Invalid URL format. Please enter valid URL.'));
			return;
		}
		insertVersion('url');
	}
	
	function checkIfAttachmentExists(answer) {
		if(answer.getRowCount() == 0) {
			g_form.addErrorMessage(getMessage('Please upload attachment'));
			return;
		}
		insertVersion('attachment');
	}
	
	function insertVersion(type) {
		var ga = new GlideAjax('DocumentObjectManager');
		ga.addParam('sysparm_name', 'insertVersion');
		ga.addParam('sysparm_document_type', type);
		ga.addParam('sysparm_document_sys_id', g_form.getValue('document'));
		ga.addParam('sysparm_document_version_sys_id', docVersionSysId);
		ga.addParam('sysparm_version_notes',g_form.getValue('notes'));
		
		if(type == 'url') {
			ga.addParam('sysparam_url_value', g_form.getValue('url'));
		}
		
		ga.getXMLAnswer(function(xmlAnswer) {
			if(xmlAnswer == null) {
				g_form.addErrorMessage(getMessage('You dont have permission to create version'));
			}
			setTimeout(function() {
				g_aw.closeRecord();
			}, 500);
			return true;
		});
	}
	
}
