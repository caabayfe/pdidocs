(function executeRule(current, previous /*null when async*/ ) {

    // Empty cmdb group is allowed
    if (current.cmdb_group == '' || current.cmdb_group == null)
        return;

    // No need to perform check on update operation in case the cmdb group field was not changed
    var op = current.operation();
    if (op == 'update' && current.cmdb_group == previous.cmdb_group)
        return;

    // Abort the operation in case a dynamic CI group with the same CMDB group already exists
    var gr = new GlideRecord('cmdb_ci_query_based_service');
    gr.addQuery('cmdb_group', current.cmdb_group);
    gr.query();
    if (gr.next()) {
        if (gr.getValue("sys_id") != current.sys_id) {
            current.setAbortAction(true);
            var dynamicCIGroup = gr.getValue('name');
            gs.addErrorMessage(gs.getMessage("The dynamic CI group {0} is already based on this CMDB group. You cannot create more than one dynamic CI group based on the same CMDB group.", dynamicCIGroup));
        }
    }

})(current, previous);
