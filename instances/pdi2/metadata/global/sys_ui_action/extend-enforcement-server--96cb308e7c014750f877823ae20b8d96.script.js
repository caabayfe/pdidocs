(function executeRule(current, previous) {
    try {
        var ENFORCEMENT_DATE_PROP = 'glide.authenticate.basic_auth.restriction.enforcement_date';
        var ENFORCE_PROP = 'glide.authenticate.basic_auth.restriction.enforce';
        var currentDateStr = gs.getProperty(ENFORCEMENT_DATE_PROP, '');
        if (gs.nil(currentDateStr)) {
            gs.addErrorMessage(gs.getMessage('Enforcement date property not found or is empty.'));
            return;
        }
        var gdt = new GlideDateTime(currentDateStr);
        gdt.addDaysUTC(14);
        var newDateStr = gdt.getValue();
        var dateProp = new GlideRecord('sys_properties');
        dateProp.addQuery('name', ENFORCEMENT_DATE_PROP);
        dateProp.query();
        if (dateProp.next()) {
            dateProp.setValue('value', newDateStr);
            dateProp.update();
        }
        var enforceProp = new GlideRecord('sys_properties');
        enforceProp.addQuery('name', ENFORCE_PROP);
        enforceProp.query();
        if (enforceProp.next() && enforceProp.getValue('value') !== 'false') {
            enforceProp.setValue('value', 'false');
            enforceProp.setWorkflow(false);
            enforceProp.update();
        }
        GlidePropertiesDB.invalidate();
        var AUDIT_MARKER = 'admin';
        var reactivateBanner = function(tableName, sysId, columnName) {
            if (!GlideTableDescriptor.isValid(tableName)) return;
            var rGr = new GlideRecord(tableName);
            if (!rGr.get(sysId)) return;
            rGr.setValue(columnName, '');
            rGr.autoSysFields(false);
            rGr.setValue('sys_updated_by', AUDIT_MARKER);
            rGr.setValue('sys_updated_on', new GlideDateTime().getValue());
            rGr.setWorkflow(false);
            rGr.update();
            gs.info('Basic Auth: re-activated banner ' + sysId + ' in ' + tableName);
        };
        reactivateBanner('sys_ux_banner_announcement', '1611c033ff74c31029a2ffffffffff4a', 'end');
        reactivateBanner('announcement', '9a11c033ff74c31029a2ffffffffff48', 'to');
        gs.log('Basic Auth enforcement date updated from ' + currentDateStr + ' to ' + newDateStr + '; enforce set to false', 'EnforcementDateUpdate');
        gs.addInfoMessage(gs.getMessage('Enforcement postponed. New enforcement date: {0}. Announcement banners re-activated.', newDateStr));
    } catch (e) {
        gs.logError('Failed to postpone enforcement: ' + e.message, 'EnforcementDateUpdate');
        gs.addErrorMessage(gs.getMessage('An error occurred while postponing enforcement. Please contact your administrator.'));
    }
    action.setRedirectURL('sys_user_basic_auth_exception_list.do');
})(current, previous);
