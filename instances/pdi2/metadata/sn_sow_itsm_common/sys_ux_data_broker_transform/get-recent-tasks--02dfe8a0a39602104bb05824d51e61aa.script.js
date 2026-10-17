function transform(input) {
    if (!input || !input.openedFor || !input.recentQuery) {
        return [];
    }

    var callerRecordsTask = [];
    var userId = input.openedFor;
    var recentQuery = input.recentQuery;

    var inc = "sys_class_name=incident^ref_incident.caller_id=" + userId;
    var prb = "sys_class_name=problem^opened_by=" + userId;
    var chg = "sys_class_name=change_request^ref_change_request.requested_by=" + userId;
    var scr = "sys_class_name=sc_request^ref_sc_request.requested_for=" + userId;

    var taskQuery = inc + "^NQ" + prb + "^NQ" + chg + "^NQ" + scr + "^ORDERBYDESCsys_created_on";

    var taskGr = new GlideRecordSecure('task');
    taskGr.addEncodedQuery(taskQuery, false);
    taskGr.addQuery(recentQuery);
    taskGr.setLimit(10);
    taskGr.query();

    while (taskGr.next()) {
        var record = {};
        record['table'] = taskGr.getValue('sys_class_name');
        record['sys_id'] = taskGr.getValue('sys_id');
        record['number'] = taskGr.getValue('number');
        record['sys_created_on'] = taskGr.getValue('sys_created_on');
        record['short_description'] = taskGr.getValue('short_description');
        record['priority'] = taskGr.getValue('priority');
        record['priority_label'] = taskGr.getDisplayValue('priority');
        record["labelled_row_one"] = [];
        if (taskGr.getValue('priority')) record["labelled_row_one"].push({
            "label": taskGr.priority.getLabel(),
            "value": taskGr.getDisplayValue('priority')
        });
        if (taskGr.getValue('sys_created_on')) {
            var gdt = new GlideDateTime(taskGr.getValue('sys_created_on'));
            var dateOnly = gdt.getLocalDate().getDisplayValue();
            record["labelled_row_one"].push({
                "label": gs.getMessage("Opened"),
                "value": dateOnly
            });
        }
        record["labelled_row_two"] = [];
        if (taskGr.getValue('state')) record["labelled_row_two"].push({
            "label": taskGr.state.getLabel(),
            "value": taskGr.getDisplayValue('state')
        });
        if (taskGr.getValue('assignment_group')) record["labelled_row_two"].push({
            "label": taskGr.assignment_group.getLabel(),
            "value": taskGr.getDisplayValue('assignment_group')
        });

        callerRecordsTask.push(record);
    }

    return callerRecordsTask;
}
