gs.info("Started execution of fix script: Set Access control type to be user_roles when empty");
executeFix();
gs.info("Finished execution of fix script: Set Access control type to be user_roles when empty");

function executeFix() {
    var tablesToFix = ['sys_sg_native_client', 'sys_sg_applet_launcher', 'sys_sg_section'];
    for (var i = 0; i < tablesToFix.length; i++)
        setDefaultAccessControlType(tablesToFix[i]);
}

function setDefaultAccessControlType(tableName) {
    var fieldName = 'access_control_type';
    var gr = new GlideRecord(tableName);

	if (!gr.isValid()) {
        gs.error("Cannot run the script for updating access_control_type, invalid table: " + tableName);
        return;
    }

	if (!gr.isValidField(fieldName)) {
        gs.error("Cannot run the script for updating access_control_type, invalid column name: " + fieldName);
        return;
    }

    gr.addEncodedQuery(fieldName + 'ISEMPTY');
    gr.setWorkflow(false);
    gr.setValue(fieldName, 'user_roles');
    gr.updateMultiple();
}
