(function executeRule(current, previous /*null when async*/ ) {
    var policyId = current.getValue("policy_id");
    var grPolicy = new GlideRecordSecure("cmdb_data_management_policy");
    grPolicy.get(policyId);
    if (grPolicy.isValid()) {
        var action = grPolicy.getValue("unassigned_task_actions");
        switch (action) {
            case "create_task_unassigned":
                break;
            case "create_task_assigned_to_user":
                current.setValue('assigned_to', grPolicy.getValue('unassigned_task_assignment'));
                break;
            case "create_task_assigned_to_group":
                current.setValue('assignment_group', grPolicy.getValue('unassigned_task_assignment'));
                break;
        }
    }
})(current, previous);
