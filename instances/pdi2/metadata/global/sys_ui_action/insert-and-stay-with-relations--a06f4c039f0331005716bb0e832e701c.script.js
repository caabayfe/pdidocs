doInsertAndStayWithBreakdowns();

function doInsertAndStayWithBreakdowns() {
    var saveMe = current;
    var old_id = current.getValue('sys_id');
    current.sys_scope = gs.getCurrentApplicationId();
    var new_id = current.insert();

    duplicateRecords('pa_indicator_breakdowns', old_id, new_id);
    duplicateRecords('pa_indicator_breakdown_excl', old_id, new_id);
    duplicateRecords('pa_indicator_aggregate_excl', old_id, new_id);
    duplicateOwnedJobs(old_id, new_id);

    action.setRedirectURL(saveMe);
}

function duplicateOwnedJobs(old_val, new_val) {
    var notOwnedJobs = [];
    var user = gs.getUser().getID();

    var gr = new GlideRecord('pa_job_indicators');
    gr.addQuery('indicator', old_val);
    gr.query();
    while (gr.next()) {
        if (gr.job.run_as != user) {
            notOwnedJobs.push(gr.job.name);
        } else {
            gr.setValue('indicator', new_val);
            gr.sys_scope = gs.getCurrentApplicationId();
            gr.insert();
        }
    }

    if (notOwnedJobs.length > 0) {
        gs.addInfoMessage(gs.getMessage('jobs_not_related', notOwnedJobs.join()));
    }
}

function duplicateRecords(table, old_val, new_val) {
    if (new_val == null || new_val == '')
        return;

    var gr = new GlideRecord(table);
    gr.addQuery('indicator', old_val);
    gr.query();
    while (gr.next()) {
    	var newGR = new GlideRecord(table);
        newGR.get(gr.sys_id);
        newGR.setValue('indicator', new_val);
        newGR.sys_scope = gs.getCurrentApplicationId();
        newGR.insert();
    }
}
