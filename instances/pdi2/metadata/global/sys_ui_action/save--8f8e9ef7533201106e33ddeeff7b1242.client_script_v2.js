function onClick(g_form) {
	var docVersionSysId = g_form.getUniqueValue();
	
	var ga = new GlideAjax('DocumentObjectManager');
	ga.addParam('sysparm_name', 'updateVersion');
	ga.addParam('sysparm_document_version_sys_id', docVersionSysId);
	ga.addParam('sysparm_version_notes',g_form.getValue('notes'));
	ga.getXMLAnswer(function(xmlAnswer) {
			if(xmlAnswer == null) {
				g_form.addErrorMessage(getMessage('You dont have permission to update version'));
			}
			setTimeout(function() {
				g_aw.closeRecord();
			}, 500);
			return true;
		});
}
