doInsertAndStayWithIndicators();
function doInsertAndStayWithIndicators() {
    var saveMe = current;
    var old_id = current.getValue('sys_id');
    current.sys_scope = gs.getCurrentApplicationId();
    var new_id = current.insert();

    duplicateRecords('pa_breakdown_mappings', old_id, new_id);
	duplicateRecords('pa_indicator_breakdowns',     old_id, new_id);
    duplicateRecords('pa_indicator_breakdown_excl', old_id, new_id);
    duplicateRecords('pa_breakdown_relations', old_id, new_id);
    duplicateRecords('pa_job_indicator_breakdown_ex', old_id, new_id);

    action.setRedirectURL(saveMe);
}

function duplicateRecords(table, old_val, new_val) {
    var gr = new GlideRecord(table);
    gr.addQuery('breakdown', old_val);
    gr.query();
    while (gr.next()){
        gr.setValue('breakdown', new_val);
        gr.sys_scope = gs.getCurrentApplicationId();
        gr.insert();
    }
}
