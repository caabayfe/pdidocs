(function executeRule(current, previous /*null when async*/ ) {

    if (current.table == '') {
        current.table = (current.task_configuration.reference_table != '') ? current.task_configuration.reference_table : current.task_configuration.table;
    }

})(current, previous);
