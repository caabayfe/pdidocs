function unmapCustomTablesFromGrandfatherLicense() {
    var sysIdsList = [];
	
	//for multiple records - first try to get the checked values which this action is allowed, then fall back on g_list.getChecked()
    if (typeof g_list != 'undefined' && typeof rowSysId == 'undefined') {
        var sysIds = gel('2d5018b0eb13011078aca892e252284d').getAttribute('gsft_allow');
        if (sysIds === null || sysIds === "") {
            sysIds = g_list.getChecked();
        }
        sysIdsList = sysIds.split(',');
    } else {
        //for single record
        var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? g_form.getUniqueValue() : rowSysId;
        sysIdsList.push(sysId);
    }
    showunMapSubscriptionConfDlg(sysIdsList, sysIdsList.length);
}

function showunMapSubscriptionConfDlg(sysIdsList, totalCount) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('confirm_map_unmap_custom_tab_gf_license');
    dlg.setTitle(new GwtMessage().getMessage('Un-Map Custom Table(s) from Grandfather License'));
    dlg.setWidth(500);
    dlg.setPreference('sysparm_obj_list', sysIdsList);
    dlg.setPreference('sysparm_total_count', totalCount);
    dlg.setPreference('sysparm_show_confirmation', true);
    dlg.setPreference('sysparm_operation_type', 'unmap');
    dlg.render();
}
