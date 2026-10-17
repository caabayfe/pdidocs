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
var referringUrl;

function confirmAndDeleteFromForm() {
    objSysId = g_form.getUniqueValue();
    tblName = g_form.getTableName();
    fromRelList = g_form.getParameter('sysparm_from_related_list');
    module = g_form.getParameter('sysparm_userpref_module');
    listQuery = g_form.getParameter('sysparm_record_list');
    stackName = g_form.getParameter('sysparm_nameofstack');
	gotoUrl = g_form.getParameter('sysparm_goto_url');
	referringUrl = g_form.getParameter('sysparm_referring_url');

    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
    ajaxHelper.addParam('sysparm_obj_id', objSysId);
    ajaxHelper.addParam('sysparm_table_name', tblName);
    ajaxHelper.addParam('sysparm_nameofstack', stackName);
	if (gotoUrl && gotoUrl != ""){
		ajaxHelper.addParam('sysparm_goto_url', gotoUrl);
	}else if(referringUrl && referringUrl !=""){
		//if there is referring url(set in edit handler) and no goto url set
	    //it must be coming from kb_view.do
		ajaxHelper.addParam('sysparm_goto_url', "knowledge_home_launcher.do");
	}
    ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneFormKnowledge.bind(this), null, null);
}


function getCascadeDelTablesDoneFormKnowledge(answer, s) {
    
    var ansrArray = answer.split(';');
    returnUrl = ansrArray[0];
    var objList = ansrArray[2];
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('knowledge_delete_confirm_form');
    dlg.setTitle('Confirmation');
    if(objList == null) {
       dlg.setWidth(275);
    } else {
       dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_id', objSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_delobj_list', objList);  
    dlg.setPreference('sysparm_parent_form', this);
    dlg.setPreference('focusTrap', true);
    dlg.render();
    
}

function deleteCompletedKnowledge() {
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
