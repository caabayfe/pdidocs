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

    ajaxHelper = new GlideAjax('DeleteRibbonRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
    ajaxHelper.addParam('sysparm_obj_id', objSysId);
    ajaxHelper.addParam('sysparm_table_name', tblName);
    ajaxHelper.addParam('sysparm_nameofstack', stackName);
	ajaxHelper.addParam('sysparm_setting_table', g_form.getValue('table'));
    ajaxHelper.setWantSessionMessages(false);
	if (gotoUrl && gotoUrl != "")
		ajaxHelper.addParam('sysparm_goto_url', setRedirectFields(gotoUrl));
	
    ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneForm.bind(this), null, null); 
}

function getCascadeDelTablesDoneForm(answer, s) {
    
    var ansrArray = answer.split(';');
	var displayMessage = ansrArray[0];
    returnUrl = ansrArray[1];
    var objList = ansrArray[3];
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('delete_confirm_form');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
	if (displayMessage != 'null')
		dlg.setPreference('sysparm_msg_override', displayMessage);
    if(objList == null) {
       dlg.setWidth(350);
    } else {
       dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_id', objSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_delobj_list', objList);  
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

// this logic is similar to that in RedirectTransaction.setRedirectURL
function setRedirectFields(gotoURL) {
	if (gotoURL.indexOf('$sys_id') > -1)
		gotoURL = gotoURL.replace(/\$sys_id/g, g_form.getUniqueValue());
	
	if (gotoURL.indexOf('$action') > -1)
		gotoURL = gotoURL.replace(/\$action/g, 'sysverb_delete');
	
	if (gotoURL.indexOf('$display_value') > -1)
		gotoURL = gotoURL.replace(/\$display_value/g, g_form.getDisplayValue());
	
	return gotoURL;
}
