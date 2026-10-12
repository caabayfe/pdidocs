(function executeRule(current, previous /*null when async*/ ) {
    current.table = current.sttrm_model.getRefRecord().getValue('table_name');
})(current, previous);
