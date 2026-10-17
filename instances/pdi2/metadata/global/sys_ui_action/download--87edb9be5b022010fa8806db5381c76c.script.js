function confirmAndDownload() {	
	var selSysId = g_form.getUniqueValue();
	var	tblName = g_form.getTableName();
	var sysIdList = selSysId.split(',');
	var numSel = sysIdList.length;
		
	if (numSel > 0) {
		var ajaxHelper = new GlideAjax('DocumentObjectManager');
        ajaxHelper.addParam('sysparm_name', 'downloadDocuments');
        ajaxHelper.addParam('sysparm_obj_list', sysIdList);
        ajaxHelper.getXMLAnswer(downloadDocumentsHelper.bind(this));
	}
}

function downloadDocumentsHelper(attachmentIds, s) {	
	if (!attachmentIds || 0 === attachmentIds.length) {
		var dlg = new GlideDialogWindow('download_document_error');
		dlg.setTitle(new GwtMessage().getMessage('ERROR'));
		dlg.setWidth(300);
		dlg.render();
	} else {
		var attachmentIdArr = attachmentIds.split(',');
		for (var i = 0; i < attachmentIdArr.length; i++) {
			var url = new GlideURL('/sys_attachment.do?sys_id=' + attachmentIdArr[i]);
			var w = getTopWindow();
			var newWindow = w.open(url.getURL());
			newWindow.focus();
		}
	}
}
