var tblName;
var ajaxHelper;
var selSysIds;
var sysIdList;
var indx = 0;
var numSel = 0;
var gList;

function confirmAssociatedMIDs() {
    var gwt = new GwtMessage();
    gList = g_list;
    var profileIds = gList.getChecked();
    if (!profileIds)
        return;

    // get MIDs associated with profiles
    var midsCount = 0;
    var sysidList = profileIds.split(",");
    var ga = new GlideAjax("MIDServerAjax");
    ga.addParam("sysparm_name", 'getMidsfromProfile');
    for (var i = 0; i < sysidList.length; i++) {
        ga.addParam("sysparm_profile", sysidList[i]);
        ga.getXMLWait();
        midsCount = ga.getAnswer();
        if (midsCount > 0)
            break;
    }

    //If any MID server belongs to any selected profile then prompt user to confirm deletion
    if (midsCount > 0) {
        var gm = new GlideModal('glide_confirm_standard');
        gm.setTitle(gwt.getMessage('Warning: MID Servers associated to MID Profile(s)'));
        var bodymsg = gwt.getMessage("Some of the MID Profiles selected have MID Servers associated to them. Are you sure you want to delete these records?");
        var cncelmsg = gwt.getMessage("cancel");
        var okmsg = gwt.getMessage("Delete MID Profile(s)");
        if (sysidList.length == 1) {
            bodymsg = gwt.getMessage("This profile is assigned to: {0} MID server(s). Are you sure you want to delete this record?", midsCount);
        }
        gm.renderWithContent('\
				<div style="padding:15px"><p>' + bodymsg + '</p>\
					<div style="padding:5px;float:right">\
						<button style="padding:5px;margin-right:10px" \
							onclick="top.window.takeAction(true)" \
							class="btn btn-default">' + okmsg + '</button>\
						<button style="padding:5px" \
							onclick="top.window.takeAction(false)" \
							class="btn btn-primary">' + cncelmsg + '</button>\
					</div> \
				</div>');

        top.window.takeAction = function(deleteRecord) {
            gm.destroy();
            if (deleteRecord) {
                confirmAndDeleteFromList();
            } else {
                return;
            }
        };
        return false; //prevents the form from submitting when the dialog first loads
    } else {
        confirmAndDeleteFromList();
    }
}

function confirmAndDeleteFromList() {
    tblName = gList.getTableName();
    selSysIds = gList.getChecked();
    sysIdList = selSysIds.split(',');
    numSel = sysIdList.length;

    if (numSel > 0) {
        indx = 0;
        ajaxHelper = new GlideAjax('DeleteRecordAjax');
        getCascadeDeleteTables();
    }
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
        if (ansrArray.length > 1) selObjName = ansrArray[1];
        if (ansrArray.length > 2) delObjList = ansrArray[2];
    }

    if (delObjList != '') {
        if (numSel > 1) {
            showListConfDlg("true", selObjName, delObjList);
        } else {
            showListConfDlg("true", '', delObjList);
        }

    } else {
        indx++;
        if (indx < numSel) {
            ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
            ajaxHelper.addParam('sysparm_table_name', tblName);
            ajaxHelper.addParam('sysparm_obj_id', sysIdList[indx]);
            ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneList.bind(this), null, null);
        } else {
            showListConfDlg("false", '');
        }
    }
}

function showListConfDlg(hasCascadeDel, selObjName, delObjList) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_confirm_list');
    var title = typeof GwtMessage !== 'undefined' ? new GwtMessage().getMessage('Confirmation') : 'Confirmation';
    dlg.setTitle(title);
    if (delObjList == null) {
        dlg.setWidth(300);
    } else {
        dlg.setWidth(450);
    }

    dlg.setPreference('sysparm_obj_list', selSysIds);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_has_cascade_del', hasCascadeDel);
    dlg.setPreference('sysparm_sel_obj_name', selObjName);
    dlg.setPreference('sysparm_del_obj_list', delObjList);
    dlg.setPreference('focusTrap', true);
    dlg.render();
}
