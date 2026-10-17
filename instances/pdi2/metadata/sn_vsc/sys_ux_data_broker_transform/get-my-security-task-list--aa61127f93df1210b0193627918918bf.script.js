function transform(input) {
    var taskManagerUtil = new sn_vsc.SCTaskManagerOperations();
    var results = [];

    if (!input.user) {
        return results;
    }

    var tableName = "sn_vsc_security_task";
    var orderedList = [];
    var priorities = [1, 2, 3, 4]; //Define priorities

    for (var i = 0; i < priorities.length; i++) {
        var priorityLevel = priorities[i];

        //First, fetch records with a due date for this priority
        var grWithDueDate = new GlideRecordSecure(tableName);
        grWithDueDate.addQuery('assigned_to', input.user);
        grWithDueDate.addQuery('priority', priorityLevel);
        grWithDueDate.addNotNullQuery('due_date'); //Ensure only records with due_date
        grWithDueDate.addEncodedQuery("stateNOT IN3,4", "true");
        grWithDueDate.orderBy('due_date'); //Sort by due date within the priority
        grWithDueDate.query();

        while (grWithDueDate.next()) {
            orderedList.push(grWithDueDate.getValue('sys_id'));
        }

        //Now, fetch records where due_date is empty for the same priority
        var grWithoutDueDate = new GlideRecordSecure(tableName);
        grWithoutDueDate.addQuery('assigned_to', input.user);
        grWithoutDueDate.addQuery('priority', priorityLevel);
        grWithoutDueDate.addNullQuery('due_date'); //Only records with null due_date
        grWithoutDueDate.addEncodedQuery("stateNOT IN3,4", "true");
        grWithoutDueDate.query();

        while (grWithoutDueDate.next()) {
            orderedList.push(grWithoutDueDate.getValue('sys_id'));
        }
    }

    orderedList.join(', '); //Ordered list of sys_ids

    if (orderedList.length > 0) {
        var limit = Math.min(3, orderedList.length); //Get up to first 3 records

        for (var j = 0; j < limit; j++) {
            var grTsks = new GlideRecordSecure(tableName);
            if (grTsks.get(orderedList[j])) {
                results.push({
                    "short_description": grTsks.getDisplayValue('short_description'),
                    "due_date": grTsks.due_date.getLabel() + ": " + grTsks.getDisplayValue('due_date'),
                    "priority": taskManagerUtil._getTaskPriority(grTsks.getValue('priority')),
                    "priority_display": grTsks.getDisplayValue('priority'),
                    "record_link": "/now/security-center-hub/security-task-record/sn_vsc_security_task/" + grTsks.getValue('sys_id')
                });
            }
        }
    }

    return results;
}
