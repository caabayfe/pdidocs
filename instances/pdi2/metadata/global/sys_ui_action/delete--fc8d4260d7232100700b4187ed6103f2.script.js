var ajaxHelper;
var objSysId;
var tblName;
var dlg;
var returnUrl;
var fromRelList;
var module;
var listQuery;
var stackName = null;
var gotoUrl = null;

function confirmAndDeleteFromForm() {   
    objSysId = g_form.getUniqueValue();
    tblName = g_form.getTableName();
    fromRelList = g_form.getParameter('sysparm_from_related_list');
    module = g_form.getParameter('sysparm_userpref_module');
    listQuery = g_form.getParameter('sysparm_record_list');
    stackName = g_form.getParameter('sysparm_nameofstack');
	gotoUrl = g_form.getParameter('sysparm_goto_url');

    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'isDomainUsed');
    ajaxHelper.addParam('sysparm_domain_id', objSysId);
	ajaxHelper.addParam('sysparm_nameofstack', stackName);
	if (gotoUrl && gotoUrl != "")
		ajaxHelper.addParam('sysparm_goto_url', gotoUrl);
	ajaxHelper.getXMLAnswer(showConfirmationPopup.bind(this), null, null); 
}

function showConfirmationPopup(answer, s) {
	var isDomainUsed = false;
	returnUrl = 'null';
	if(answer != null && answer == 'true')
		isDomainUsed = true;

    dlg = new GlideDialogWindow('delete_confirm_form');
    dlg.setTitle('Confirmation');
	if(isDomainUsed)
       dlg.setWidth(450);
    else
       dlg.setWidth(275);
    dlg.setPreference('sysparm_obj_id', objSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_is_domain_used', isDomainUsed);  
    dlg.setPreference('sysparm_parent_form', this);
    dlg.render();
    
}

function deleteCompleted() {
    dlg.destroy();
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
