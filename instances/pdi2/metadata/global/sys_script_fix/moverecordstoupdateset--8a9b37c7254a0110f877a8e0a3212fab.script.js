moveRecordsToUpdateSet();

function moveRecordsToUpdateSet(){
	if (pm.isZboot()) {
        return;
    }

    moveTableRecordsToUpdateSetUtil('sys_authentication_policy_criteria_m2m');
    moveTableRecordsToUpdateSetUtil('multi_factor_criteria');
    moveTableRecordsToUpdateSetUtil('sys_ip_address_subnet');
    moveTableRecordsToUpdateSetUtil('sys_auth_policy_criteria_group');
}

function moveTableRecordsToUpdateSetUtil(tableName){
    gs.info(gs.getMessage("Started running fix job to record Update Set: {0}", tableName));
    try {
        var gr = new GlideRecord(tableName);
        if (!gr.isValid()) {
            gs.error(gs.getMessage("Table not found: {0}", tableName));
            return;
        }
        gr.query();
        while (gr.next()) {
            (new GlideUpdateManager2()).saveRecord(gr);
        }
        gs.info(gs.getMessage("Completed running fix job to record Update Set: {0}", tableName));
    } catch (e) {
        gs.error(gs.getMessage("Exception occurred while running fix job to record Update Set : {0}", e.message));
    }
}
