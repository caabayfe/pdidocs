var ajaxHelper;
var selSysIds;
var sysIdList;
var indx = 0;
var numSel = 0;
var currentUrl;

function confirmAndDeleteFromList() {
	responsibilitiesSysIds = g_list.getChecked();
	sysIdList = responsibilitiesSysIds.split(',');
	numSel = sysIdList.length;
	
	if(numSel > 0) {
		ajaxHelper = new GlideAjax('DeleteResponsibilityRecordAjax');
		ajaxHelper.addParam('sysparm_name', 'getResponsibilities');
		ajaxHelper.addParam('sysparm_obj_id', responsibilitiesSysIds);
		ajaxHelper.addParam('sysparm_nameofstack', null);
		ajaxHelper.getXMLAnswer(getResponsibilitiesDone.bind(this), null, null);
	}
}

function getResponsibilitiesDone(answer, s) {
	if (!answer)
		return;
	var ansrArray = answer.split(';');
	returnUrl = ansrArray[0];
	var objList = ansrArray[1];
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	dlg = new dialogClass('delete_responsibility_confirm_form');
	dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
	if(objList == null)
		dlg.setWidth(275);
	else
		dlg.setWidth(450);
	dlg.setPreference('sysparm_obj_id', responsibilitiesSysIds);
	dlg.setPreference('sysparm_contact_list', objList);
	dlg.setPreference('sysparm_parent_form', this);
	dlg.render();
}
