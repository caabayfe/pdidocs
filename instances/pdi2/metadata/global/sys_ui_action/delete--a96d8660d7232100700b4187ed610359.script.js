var tblName;
var ajaxHelper;
var selSysIds;
var sysIdList;
var indx = 0;
var numSel = 0;
var isDomainUsed = false;

function confirmAndDeleteFromList() {
    tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
    sysIdList = selSysIds.split(',');
    numSel = sysIdList.length;
    if(numSel > 0) {
        indx = 0;
        ajaxHelper = new GlideAjax('DeleteRecordAjax');
        deleteDomains();
    }
}

function deleteDomains() {
	ajaxHelper.addParam('sysparm_name', 'areDomainsUsed');
	ajaxHelper.addParam('sysparm_domain_ids',selSysIds);
	ajaxHelper.addParam('sysparm_table_name', tblName);
	ajaxHelper.addParam('sysparm_nameofstack', null);
    ajaxHelper.getXMLAnswer(deleteDomainsDoneList.bind(this), null, null);
}

function deleteDomainsDoneList(answer, s) {
    if(answer && answer == 'true')
		isDomainUsed = true;
	else
		isDomainUsed = false;
	dlg = new GlideDialogWindow('delete_confirm_list');
    dlg.setTitle('Confirmation');
	if(isDomainUsed)
       dlg.setWidth(450);
    else
       dlg.setWidth(275);
    dlg.setPreference('sysparm_obj_list', selSysIds);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_is_domain_used', isDomainUsed); 
	dlg.setPreference('sysparm_has_cascade_del', 'false');
    dlg.setPreference('sysparm_parent_form', this);
    dlg.render();
    
}
