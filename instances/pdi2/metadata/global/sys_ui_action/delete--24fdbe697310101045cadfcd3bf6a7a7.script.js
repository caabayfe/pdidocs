var tblName;
var ajaxHelper;
var selSysIds;
var sysIdList;
var indx = 0;
var numSel = 0;
var csdmIdx = 0;
var appServiceNameArr = [];
var groupNameArr = [];
var groupNameText = '';
var groupEvent = null;
var appServiceNameAndMessage = '';
var hasAppServiceRef = false;

function confirmAndDeleteFromList() {
    tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
    sysIdList = selSysIds.split(',');
    numSel = sysIdList.length;
	
	csdmCheck();
	// check if Application Service is assoc. with CMDB Group
	function csdmCheck() {
		var csdmClientHelper = new GlideAjax('CSDMClientHelper');
		csdmClientHelper.addParam('sysparm_name', 'searchGroups');
		csdmClientHelper.addParam('sysparm_sys_id', sysIdList[csdmIdx]);
		csdmClientHelper.getXML(csdmClientHelperAnswer);
		groupEvent = GlideList2.get('cmdb_group');
	}
	
	// CSDM Callback
	function csdmClientHelperAnswer(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		if (groupEvent.getCell(sysIdList[csdmIdx], 'group_name') && answer) {
			groupEvent = new GlideList2.get('cmdb_group');
			groupNameText = groupEvent.getCell(sysIdList[csdmIdx], 'group_name').innerText;
			groupNameArr.push(groupNameText);
			appServiceNameArr.push(answer);
		}
		// Loop if multiples have been checked
		if (csdmIdx < sysIdList.length) {
			csdmIdx++;
			csdmCheck();
			
		} else {
			// Set whether has reference and reset csdmIdx and continue with confirmation delete
			hasAppServiceRef = (appServiceNameArr.length) ? true : false;
			csdmIdx = 0;
			initAjaxHelper();
		}
	}
	
	function initAjaxHelper() {
		if(numSel > 0) {
			indx = 0;
			ajaxHelper = new GlideAjax('DeleteRecordAjax');
			getCascadeDeleteTables();
		}
	}
	
}

function getCascadeDeleteTables() {
    if(sysIdList[indx] != '') {
        ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
        ajaxHelper.addParam('sysparm_obj_id', sysIdList[indx]);
        ajaxHelper.addParam('sysparm_table_name', tblName);
        ajaxHelper.addParam('sysparm_nameofstack', null);
        ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneList.bind(this), null, null);
    }
}

function getCascadeDelTablesDoneList(answer, s) {
	var delObjList = '';
	var selObjName = '';

    if(answer != '') {     
        var ansrArray = answer.split(';');
        if(ansrArray.length > 1) selObjName = ansrArray[1];
        if(ansrArray.length > 2) delObjList = ansrArray[2];
    }
    
    if(delObjList != '') {
	if(numSel > 1) {
		showListConfDlg("true", selObjName, delObjList);
        } else {
			showListConfDlg("true" , '', delObjList);
	}

    } else {
		indx++;
        if(indx < numSel) {
			ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
			ajaxHelper.addParam('sysparm_table_name', tblName);
			ajaxHelper.addParam('sysparm_obj_id', sysIdList[indx]);
			ajaxHelper.setWantSessionMessages(false);
			ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneList.bind(this), null, null);
		} else {
			showListConfDlg("false", '');
		}
    }
}

function showListConfDlg(hasCascadeDel, selObjName, delObjList) {
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	// Modal type dependent upon cmdb group has reference or not
    var dlg = (hasAppServiceRef) ? new dialogClass('cmdb_csdm_delete_confirm_list') : new dialogClass('delete_confirm_list');
    var title = typeof GwtMessage !== 'undefined' ? new GwtMessage().getMessage('Confirmation') : 'Confirmation';
	
	// If has a Application Service reference override default message
	if (hasAppServiceRef) {
		var isPlural = (appServiceNameArr.length > 1) ? true : false;
		groupNameArr = groupNameArr.join(', ');
		appServiceNameArr = appServiceNameArr.join(', ');
		if (isPlural) {
			appServiceNameAndMessage = new GwtMessage().format(getMessage("CMDB Groups: {0} are referenced by the following application services: {1}. Deleting these CMDB groups invalidates those application services. Would you still like to delete these CMDB groups?"), groupNameArr, appServiceNameArr);
		} else {
		appServiceNameAndMessage = new GwtMessage().format(getMessage("CMDB Group: {0} is referenced by the following application service: {1}. Deleting this CMDB group invalidates this application service. Would you still like to delete these CMDB groups?"), groupNameArr, appServiceNameArr);
		}
		//Over ride default message
		dlg.setPreference("sysparm_msg_override", appServiceNameAndMessage); 
	}
	
    dlg.setTitle(title);
    if(delObjList == null && !hasAppServiceRef) {
        dlg.setWidth(300);
    } else if (hasAppServiceRef)  {
		// Application Service reference size
		dlg.setWidth(425);
	} else {
        dlg.setWidth(450);
    }
    
    dlg.setPreference('sysparm_obj_list', selSysIds);
    dlg.setPreference('sysparm_table_name', tblName);
	dlg.setPreference('sysparm_has_cascade_del', hasCascadeDel);
    dlg.setPreference('sysparm_sel_obj_name', selObjName);
	dlg.setPreference('sysparm_del_obj_list', delObjList);
    dlg.render();
	// Reset arrays
	groupNameArr = [];
	appServiceNameArr = [];
}
