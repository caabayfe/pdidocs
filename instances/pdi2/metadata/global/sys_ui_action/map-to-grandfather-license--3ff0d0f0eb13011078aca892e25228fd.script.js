function mapCustomTablesToGrandfatherLicense() {
    var sysIdsList = [];

    //for multiple records - first try to get the checked values which this action is allowed, then fall back on g_list.getChecked()
    if (typeof g_list != 'undefined' && typeof rowSysId == 'undefined') {
        var sysIds = gel('3ff0d0f0eb13011078aca892e25228fd').getAttribute('gsft_allow');
        if (sysIds === null || sysIds === "") {
            sysIds = g_list.getChecked();
        }
        sysIdsList = sysIds.split(',');
    } else {
        //for single record
        var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? g_form.getUniqueValue() : rowSysId;
        sysIdsList.push(sysId);
    }

    var ajaxHelper = typeof snc != 'undefined' ? new snc.GlideAjax('GlideUserSubscriptionAjax') : new GlideAjax('GlideUserSubscriptionAjax');
    ajaxHelper.addParam('sysparm_name', 'getTablesAvailableForGrandfatherLicense');
    ajaxHelper.getXMLWait();
    var response = JSON.parse(ajaxHelper.getAnswer());

    if (response) {
        var gf = new GlideForm();
        if (sysIdsList.length > response.tablesAvailable) {
            gf.clearMessages();
            gf.addErrorMessage(new GwtMessage().getMessage('Only {0} more table(s) can be mapped to Grandfather license. Please select {1} table(s) instead of {2}', response.tablesAvailable, response.tablesAvailable, sysIdsList.length));
            return;
        }
        showMapSubscriptionConfDlg(response.licenseSysId, sysIdsList, sysIdsList.length);
    }
}

function showMapSubscriptionConfDlg(licenseSysId, sysIdsList, totalCount) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('confirm_map_unmap_custom_tab_gf_license');
    dlg.setTitle(new GwtMessage().getMessage('Map Custom Table(s) to Grandfather License'));
    dlg.setWidth(500);
    dlg.setPreference('sysparm_license_sys_id', licenseSysId);
    dlg.setPreference('sysparm_obj_list', sysIdsList);
    dlg.setPreference('sysparm_total_count', totalCount);
    dlg.setPreference('sysparm_show_confirmation', true);
    dlg.setPreference('sysparm_operation_type', 'map');
    dlg.render();
}
