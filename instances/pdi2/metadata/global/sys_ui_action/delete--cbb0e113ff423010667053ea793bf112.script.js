var objSysId;
var tblName;
var dlg;
var returnUrl;
var module;
var listQuery;
var stackName = null;
var gotoUrl = null;

function confirmAndDeleteFromForm() {
	objSysId = g_form.getUniqueValue();
	tblName = g_form.getTableName();
	module = g_form.getParameter('sysparm_userpref_module');
	listQuery = g_form.getParameter('sysparm_record_list');
	stackName = g_form.getParameter('sysparm_nameofstack');
	gotoUrl = g_form.getParameter('sysparm_goto_url');

	var ajaxHelper = new GlideAjax('DeleteRecordAjax');
	ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
	ajaxHelper.addParam('sysparm_obj_id', objSysId);
	ajaxHelper.addParam('sysparm_table_name', tblName);
	ajaxHelper.addParam('sysparm_nameofstack', stackName);
	ajaxHelper.setWantSessionMessages(false);
	if (gotoUrl && gotoUrl != '')
		ajaxHelper.addParam('sysparm_goto_url', setRedirectFields(gotoUrl));
	ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneForm.bind(this), null, null);
}

function getCascadeDelTablesDoneForm(answer, s) {
	var ansrArray = answer.split(';');
	returnUrl = ansrArray[0];
	var objList = ansrArray[2];
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	dlg = new dialogClass('delete_playbook_activity_ui_page');
	dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
	
	if (objList == null) 
		dlg.setWidth(375);
	else 
		dlg.setWidth(450);
	
	
	var activityUILink = editInUIBuilderLink();
	
	dlg.setPreference('sysparm_obj_id', objSysId);
	dlg.setPreference('sysparm_table_name', tblName);
	dlg.setPreference('sysparm_delobj_list', objList);
	dlg.setPreference('sysparm_msg_override', activityUILink);
	dlg.setPreference('sysparm_cascade_msg_override', activityUILink);
	dlg.setPreference('sysparm_parent_form', this);
	dlg.setPreference('focusTrap', true);
	dlg.render();
}

function deleteCompleted() {
	dlg.destroy();
	var w = getTopWindow();
	cbField = w.document.getElementById('glide_dialog_form_target_' + tblName);
	if (cbField != null) {
		// this is a dialog form, make sure the completion callback is called
		cbField.value = 'sysverb_delete:' + objSysId;
		cbField.onchange();

		// dismiss the dialog form
		var elem = window.parent.document.getElementById('body_FormDialog');
		if (elem) new GlideWindow().locate(elem).destroy();
	} else {
		// this is a regular form, use the return URL to back to the correct view, where possible
		if (returnUrl != 'null') {
			window.location.href = returnUrl;
		} else {
			// this is just the default case, in case everything else blows up, should never happen!
			window.location.href =
				window.location.protocol +
				'//' +
				window.location.host +
				'/' +
				tblName +
				'_list.do?sysparm_userpref_module=' +
				module +
				'&sysparm_query=' +
				listQuery +
				'&sysparm_cancelable=true';
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

function editInUIBuilderLink() {
	var page = g_scratchpad.activity_ui_page;
	if (!page) {
		g_form.addInfoMessage(
			getMessage(
				'Error loading page in UI Builder. Please contact support.'
			)
		);
		return;
	}
	var variant = g_scratchpad.activity_ui_screen;
	if (!variant) {
		g_form.addInfoMessage(
			getMessage(
				'Activity UI is missing a corresponding screen in UI Builder. Please contact support.'
			)
		);
		return;
	}
	return (
		'/now/build/ui/apps/2ba981dcc31a201098c960bc0eba8f00/pages/' +
		page +
		'/variants/' +
		variant
	);
}
