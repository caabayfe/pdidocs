function removeManualCustomTableExempt() {
    var sysIdsList = [];
    var custTblNames = [];

    //for multiple records - first try to get the checked values which this action is allowed, then fall back on g_list.getChecked()
    if (typeof g_list != 'undefined' && typeof rowSysId == 'undefined') {
        var sysIds = gel('2baf73f1779601109650350bee5a99b4').getAttribute('gsft_allow');
        if (sysIds === null || sysIds === "") {
            sysIds = g_list.getChecked();
        }
        sysIdsList = sysIds.split(',');
    } else {
        //for single record
        var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? g_form.getUniqueValue() : rowSysId;
        sysIdsList.push(sysId);
    }

    //get the names of custom tables to be removed from manually exemption
    custTblNames = getCustTableNames(sysIdsList);

    showRemoveManualExemptConfDlg(custTblNames, custTblNames.length);
}

function showRemoveManualExemptConfDlg(removeExemptCustTblList, totalCount) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('confirm_manual_exempt_unexempt_custom_tables');
    dlg.setTitle(new GwtMessage().getMessage('Remove Manually Exempt Custom Table(s)'));
    dlg.setWidth(500);
    dlg.setPreference('sysparm_obj_list', removeExemptCustTblList);
    dlg.setPreference('sysparm_total_count', totalCount);
    dlg.setPreference('sysparm_show_confirmation', true);
    dlg.setPreference('sysparm_operation_type', 'unexempt');
    dlg.render();
}

function getCustTableNames(sysIdsList) {
    var customTableNames = [];
    var gr = new GlideRecord('ua_exempted_table_inventory');
    gr.addQuery('sys_id', 'IN', sysIdsList);
    gr.query();
    while (gr.next()) {
        customTableNames.push(gr.getValue('table_name'));
    }

	return customTableNames;
}
