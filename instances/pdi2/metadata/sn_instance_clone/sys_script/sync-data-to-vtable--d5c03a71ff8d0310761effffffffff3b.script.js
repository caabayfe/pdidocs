(function executeRule(current, previous /*null when async*/) {
    try {
        var VTABLE = 'sn_instance_clone_cleanup_script_execution_vtable';
        var SYNC_FIELDS = ['status', 'started', 'ended', 'duration',
                           'error_message', 'script', 'order', 'runs'];

        var name = current.getValue('name');
        var chg  = current.getValue('chg');

        // Lookup vtable row by name + chg
        var vGr = new GlideRecord(VTABLE);
        vGr.addQuery('name', name);
        vGr.addQuery('chg', chg);
        vGr.setLimit(1);
        vGr.query();

        if (vGr.next()) {
            // Match found — sync status and other relevant fields
            for (var i = 0; i < SYNC_FIELDS.length; i++) {
                var f = SYNC_FIELDS[i];
                if (vGr.isValidField(f)) {
                    vGr.setValue(f, current.getValue(f));
                }
            }
            vGr.update();
        } else {
            // No match — insert a new vtable record
            var newGr = new GlideRecord(VTABLE);
            newGr.initialize();
            newGr.setValue('name', name);
            newGr.setValue('chg', chg);
            for (var j = 0; j < SYNC_FIELDS.length; j++) {
                var sf = SYNC_FIELDS[j];
                if (newGr.isValidField(sf)) {
                    newGr.setValue(sf, current.getValue(sf));
                }
            }
            if (newGr.isValidField('instance')) {
                newGr.setValue('instance', gs.getProperty('instance_id'));
            }
            newGr.insert();
        }
    } catch (ex) {
        gs.error('[Cleanup Script Execution VTable Sync] ' +
                 ex.message + ' | Line: ' + ex.lineNumber);
    }
})(current, previous);
