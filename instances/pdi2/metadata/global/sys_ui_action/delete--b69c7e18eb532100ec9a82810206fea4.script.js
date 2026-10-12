var tblName;

var ajaxHelper;
var contextSysId;

function confirmAndDeleteContext(contextId) {
    tblName = g_list.getTableName();
    contextSysId = contextId;   
    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    getRelatedTables();
}

function getRelatedTables() {
    if(contextSysId != '') {
        ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
        ajaxHelper.addParam('sysparm_obj_id',contextSysId);
        ajaxHelper.addParam('sysparm_table_name', tblName);
        ajaxHelper.addParam('sysparm_nameofstack', null);
        ajaxHelper.getXMLAnswer(getRelatedTablesDoneList.bind(this), null, null);
    }
}

function getRelatedTablesDoneList(answer, s) {
    var delObjList = '';
    var selObjName = '';

    if(answer != '') {     
        var ansrArray = answer.split(';');
        if(ansrArray.length > 1) selObjName = ansrArray[1];
        if(ansrArray.length > 2) delObjList = ansrArray[2];
    }
	
    if(delObjList != '') {
	    showDialog("true" , '', delObjList);
    } 
}

function showDialog(hasCascadeDel, selObjName, delObjList) {
    var dlg = new GlideDialogWindow('delete_confirm_list');
    dlg.setTitle('Confirmation');
	
    if(delObjList == null) {
        dlg.setWidth(300);
    } else {
        dlg.setWidth(450);
    }
    
    dlg.setPreference('sysparm_obj_list', contextSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_has_cascade_del', hasCascadeDel);
    dlg.setPreference('sysparm_sel_obj_name', selObjName);
    dlg.setPreference('sysparm_del_obj_list', delObjList);
    dlg.render();
}
