function ok() {
    var ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromForm');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
	ajaxHelper.addParam('sysparm_disable_wf', '${JS:sysparm_disable_wf}');
	ajaxHelper.setWantSessionMessages(false);
    ajaxHelper.getXMLAnswer(function(){
		GlideDialogWindow.get().destroy();
		var TemplateModal = parent.document.getElementById('sys_template');
		if (TemplateModal) {
			window.location.href = 'modal_dialog_form_response.do';
		} else {
			var url = new GlideURL('sys_template_list.do');
			url.addParam('sysparm_query', templateConfirmQuery);
			window.location.href = url.getURL();
		}
	});
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
