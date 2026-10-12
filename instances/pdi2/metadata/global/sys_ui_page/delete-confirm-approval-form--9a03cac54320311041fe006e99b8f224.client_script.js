function ok() {
    var ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromForm');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
	ajaxHelper.addParam('sysparm_disable_wf', '${JS:sysparm_disable_wf}');
	ajaxHelper.setWantSessionMessages(false);
    ajaxHelper.getXMLAnswer(deleteCompleted);
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

function deleteCompleted() {
	var returnUrl = '${JS:sysparm_return_url}';
	var module = '${JS:sysparm_module}';
	var listQuery = '${JS:sysparm_list_query}';
	var tblName = '${JS:sysparm_table_name}';
    GlideDialogWindow.get().destroy();
    var w = getTopWindow();
    cbField = w.document.getElementById('glide_dialog_form_target_' + tblName);
    if(cbField != null) {
        // this is a dialog form, make sure the completion callback is called
        cbField.value = 'sysverb_delete:' + objSysId;
        cbField.onchange();

       // dismiss the dialog form
       var elem = window.parent.document.getElementById('body_FormDialog');
       if (elem)
           new GlideWindow().locate(elem).destroy();
    } else {
        // this is a regular form, use the return URL to back to the correct view, where possible
        if (returnUrl != 'null') {
           window.location.href = returnUrl;
        } else {
            // this is just the default case, in case everything else blows up, should never happen!
            window.location.href = window.location.protocol + '//' + window.location.host + '/' + tblName + '_list.do?sysparm_userpref_module=' + module + '&sysparm_query=' + listQuery + '&sysparm_cancelable=true';
        }
    }
}
