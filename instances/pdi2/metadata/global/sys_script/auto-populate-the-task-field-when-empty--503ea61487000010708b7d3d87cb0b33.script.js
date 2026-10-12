(function executeRule(current, previous /*null when async*/ ) {
    if (new TableUtils(current.document_table).getAbsoluteBase() == 'task')
        current.task = current.document_id;
})(current, previous);
