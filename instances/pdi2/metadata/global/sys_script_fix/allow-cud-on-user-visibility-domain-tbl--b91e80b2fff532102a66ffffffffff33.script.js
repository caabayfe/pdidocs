updateAccessPolicy('sys_user_visibility');

function updateAccessPolicy(tableName) {
    if (pm.isZboot())
        return;

    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', tableName);
    gr.query();
    if (gr.next()) {
        gs.info("Fix Script Starting Execution: Allow CUD access policies for " + tableName);
        var fields = ['create_access', 'update_access', 'delete_access'];
        var updated = false;
        // Loop through fields and enable access if currently disabled
        for (var i = 0; i < fields.length; i++) {
            if (gr.getValue(fields[i]) === '0') {
                gr.setValue(fields[i], 1);
                updated = true;
            }
        }
        // Update the record if any field was changed
        if (updated) {
            gr.setWorkflow(false);
            gr.update();
            gs.info("Fix Script: enabled CUD access policies for table " + tableName);
        } else {
            gs.info("Fix Script: CUD access policies already enabled for table " + tableName);
        }
    }
}

gs.info("Fix Script Finished Execution: CUD access policies");
