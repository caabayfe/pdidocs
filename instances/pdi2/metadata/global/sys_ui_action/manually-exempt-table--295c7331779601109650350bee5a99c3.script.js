function manualCustomTableExempt() {
    var sysIdsList = [];
    var custTblNames = [];

    //for multiple records - first try to get the checked values which this action is allowed, then fall back on g_list.getChecked()
    if (typeof g_list != 'undefined' && typeof rowSysId == 'undefined') {
        var sysIds = gel('295c7331779601109650350bee5a99c3').getAttribute('gsft_allow');
        if (sysIds === null || sysIds === "") {
            sysIds = g_list.getChecked();
        }
        sysIdsList = sysIds.split(',');
    } else {
        //for single record
        var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? g_form.getUniqueValue() : rowSysId;
        sysIdsList.push(sysId);
    }

    //get the names of custom tables to be manually exempted
    custTblNames = getCustomTableNames(sysIdsList);

    showManualExemptConfDlg(custTblNames, custTblNames.length);
}

function showManualExemptConfDlg(exemptCustTblList, totalCount) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('confirm_manual_exempt_unexempt_custom_tables');
    dlg.setTitle(new GwtMessage().getMessage('Manually Exempt Custom Table(s)'));
    dlg.setWidth(500);
    dlg.setPreference('sysparm_obj_list', exemptCustTblList);
    dlg.setPreference('sysparm_total_count', totalCount);
    dlg.setPreference('sysparm_show_confirmation', true);
    dlg.setPreference('sysparm_operation_type', 'exempt');
    dlg.render();
}

function getCustomTableNames(sysIdsList) {
    var customTableNames = [];
    var gr = new GlideRecord('sys_custom_db_object');
    gr.addQuery('sys_id', 'IN', sysIdsList);
    gr.query();
    while (gr.next()) {
        customTableNames.push(gr.getValue('source'));
    }

	return customTableNames;
}
