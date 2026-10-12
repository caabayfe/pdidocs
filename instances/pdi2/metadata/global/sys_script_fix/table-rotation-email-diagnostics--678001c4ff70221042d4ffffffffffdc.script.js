(function() {
    // Make sure business rules are running after the insertion.
    var scriptName = "Fix Script(Table Rotation -  Email Diagnostics): ";

    function createTableRotation(tableName) {
        var tableRotation = new GlideRecord('sys_table_rotation');
        tableRotation.addQuery('name', tableName);
        tableRotation.query();

        //Create Table rotations when they are not available
        if (tableRotation.hasNext()) {
            gs.info(scriptName + "Table Rotations are already available for " + tableName);
        } else {
            tableRotation.initialize();
            tableRotation.setValue('name', tableName);
            tableRotation.setValue('type', 'rotate');
            tableRotation.setValue('rotations', 7);
            tableRotation.duration = new GlideDuration('1 00:00:00');

            var sysId = tableRotation.insert();
            var tu = new SNC.TableRotationSynchronizer(tableName);
            tu.synchronize();

            gs.info(scriptName + "Table Rotations created for " + tableName + " with sys_id=" + sysId);
        }
    }
    createTableRotation("sys_email_diagnostic_info");
    createTableRotation("sys_email_job_diagnostic_info");
    createTableRotation("sys_email_errors_diagnostic_info");  
})();
