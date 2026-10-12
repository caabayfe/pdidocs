(function executeRule(current, previous /*null when async*/) {

	// Empty cmdb group is allowed
    if (current.cmdb_ci == '' || current.cmdb_ci == null)
        return;

    // No need to perform check on update operation in case the cmdb group field was not changed
    var op = current.operation();
    if (op == 'update' && current.cmdb_ci == previous.cmdb_ci)
        return;

    // Abort the operation in case a dynamic CI group with the same CMDB group already exists
    var gr = new GlideRecord('cmdb_dependent_ci_ledger');
    gr.addQuery('cmdb_ci', current.cmdb_ci);
    gr.query();
    if (gr.next()) {
        if (gr.getValue("sys_id") != current.sys_id) {
            current.setAbortAction(true);
        }
    }

})(current, previous);
