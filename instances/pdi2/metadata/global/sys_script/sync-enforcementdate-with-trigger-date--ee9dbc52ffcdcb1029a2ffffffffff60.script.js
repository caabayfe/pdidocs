(function executeRule(current, previous /*null when async*/) {

    var TABLE_SYS_TRIGGER = 'sys_trigger';
    var TRIGGER_NAME      = 'SNCRestrictBasicAuth scheduled enforcement';
    var ENFORCE_PROPERTY  = 'glide.authenticate.basic_auth.restriction.enforce';
    var AUDIT_MARKER      = 'admin';

    function applyAuditStamp(gr, isInsert) {
        gr.autoSysFields(false);
        var nowGdt = new GlideDateTime().getValue();
        if (isInsert) {
            gr.setValue('sys_created_by', AUDIT_MARKER);
            gr.setValue('sys_created_on', nowGdt);
            gr.setValue('sys_mod_count',  0);
        } else {
            var modCount = parseInt(gr.getValue('sys_mod_count') || '0', 10);
            gr.setValue('sys_mod_count', modCount + 1);
        }
        gr.setValue('sys_updated_by', AUDIT_MARKER);
        gr.setValue('sys_updated_on', nowGdt);
    }

    var dateValue = current.value.getValue();

    if (!dateValue || dateValue.trim() === '') {
        gs.addErrorMessage(gs.getMessage('Enforcement Date cannot be blank.'));
        current.setAbortAction(true);
        return;
    }

    var parsedDate = new GlideDateTime();
    parsedDate.setValue(dateValue);

    if (!parsedDate.isValid()) {
        gs.addErrorMessage(gs.getMessage('Enforcement Date is not a valid date: {0}', dateValue));
        current.setAbortAction(true);
        return;
    }

    var now = new GlideDateTime();
    if (parsedDate.compareTo(now) <= 0) {
        gs.addErrorMessage(gs.getMessage('Enforcement Date must be a future date. Provided date \"{0}\" is in the past or present.', dateValue));
        current.setAbortAction(true);
        return;
    }

    if (current.value.changes()) {

        var trigger = new GlideRecord(TABLE_SYS_TRIGGER);
        trigger.addQuery('name', TRIGGER_NAME);
        trigger.query();

        if (trigger.next()) {
            trigger.setValue('next_action', parsedDate.getValue());
            var updated = trigger.update();
            if (!updated) {
                gs.addErrorMessage(gs.getMessage('Failed to update the scheduled enforcement trigger. Please contact your administrator.'));
                current.setAbortAction(true);
                return;
            }
            gs.addInfoMessage(gs.getMessage('Scheduled enforcement trigger updated to: {0}', dateValue));
        } else {
            var gr = new GlideRecord(TABLE_SYS_TRIGGER);
            gr.initialize();
            gr.setValue('name',                TRIGGER_NAME);
            gr.setValue('job_id',              '81c92ce9c0a8016400e5f0d2f784ea78');
            gr.setValue('script',              'new SNCRestrictBasicAuthApplyFix().process();');
            gr.setValue('next_action',         parsedDate.getValue());
            gr.setValue('trigger_type',        0);
            gr.setValue('trigger_class',       'DEFAULT');
            gr.setValue('state',               0);
            gr.setValue('log',                 false);
            gr.setValue('maintenance',         false);
            gr.setValue('priority',            100);
            gr.setValue('run_count',           0);
            gr.setValue('error_count',         0);
            gr.setValue('processing_duration', 0);
            gr.setValue('job_context',         'fcScriptName=in the schedule record');
            gr.setWorkflow(false);
            applyAuditStamp(gr, true);
            var newSysId = gr.insert();
            if (!newSysId) {
                gs.addErrorMessage(gs.getMessage('Failed to recreate the scheduled enforcement trigger. Please contact your administrator.'));
                current.setAbortAction(true);
                return;
            }
            gs.addInfoMessage(gs.getMessage('Scheduled enforcement trigger recreated for: {0}', dateValue));
        }

        var isEnforced = gs.getProperty(ENFORCE_PROPERTY, 'false');
        if (isEnforced === 'true') {
            var propGr = new GlideRecord('sys_properties');
            propGr.addQuery('name', ENFORCE_PROPERTY);
            propGr.query();
            if (propGr.next()) {
                propGr.setValue('value', 'false');
                var propUpdated = propGr.update();
                if (!propUpdated) {
                    gs.addErrorMessage(gs.getMessage('Failed to reset the enforcement property. Please contact your administrator.'));
                    current.setAbortAction(true);
                    return;
                }
                gs.addInfoMessage(gs.getMessage('Enforcement property reset to false. Scheduled trigger will re-enforce on: {0}', dateValue));
            } else {
                gs.addErrorMessage(gs.getMessage('Enforcement property \"{0}\" not found.', ENFORCE_PROPERTY));
                current.setAbortAction(true);
                return;
            }
        }
    }

})(current, previous);
