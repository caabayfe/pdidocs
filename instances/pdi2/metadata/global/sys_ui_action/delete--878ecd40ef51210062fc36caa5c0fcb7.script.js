var tblName;
var ajaxHelper;
var selSysIds;
var sysIdList;
var indx = 0;
var numSel = 0;

function checkForContextListConfigs() {
    tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
    sysIdList = selSysIds.split(',');
    numSel = sysIdList.length;

    var ajaxSearch = new GlideAjax('cxs_SearchContextAJAX');
    ajaxSearch.addParam('sysparm_name', 'isConfigured');
    ajaxSearch.addParam('sysparm_context_id', g_list.getChecked());
    ajaxSearch.getXMLAnswer(function(answer) {
        if (answer == 'true') {
            var message = gs.getMessage('Remove associated record producer and table configurations before deleting Search Context');
            alert(typeof g_i18n === "undefined" ? message : g_i18n.getMessage('Remove associated record producer and table configurations before deleting Search Context'));
            return;
        }

        if (numSel > 0) {
            indx = 0;
            ajaxHelper = new GlideAjax('DeleteRecordAjax');
            getCascadeDeleteTables();
        }
    }.bind(this));
}

function getCascadeDeleteTables() {
    if (sysIdList[indx] != '') {
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

    if (answer != '') {
        var ansrArray = answer.split(';');
        if (ansrArray.length > 1)
            selObjName = ansrArray[1];
        if (ansrArray.length > 2)
            delObjList = ansrArray[2];
    }

    if (delObjList != '') {
        if (numSel > 1)
            showListConfDlg("true", selObjName, delObjList);
        else
            showListConfDlg("true", '', delObjList);
    } else {
        indx++;
        if (indx < numSel) {
            ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
            ajaxHelper.addParam('sysparm_table_name', tblName);
            ajaxHelper.addParam('sysparm_obj_id', sysIdList[indx]);
            ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneList.bind(this), null, null);
        } else
            showListConfDlg("false", '');
    }
}

function showListConfDlg(hasCascadeDel, selObjName, delObjList) {
    var dlg = new GlideModal('delete_confirm_list');
    dlg.setTitle('Confirmation');
    if (delObjList == null)
        dlg.setWidth(300);
    else
        dlg.setWidth(450);

    dlg.setPreference('sysparm_obj_list', selSysIds);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_has_cascade_del', hasCascadeDel);
    dlg.setPreference('sysparm_sel_obj_name', selObjName);
    dlg.setPreference('sysparm_del_obj_list', delObjList);
    dlg.render();
}
