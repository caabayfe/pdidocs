(function executeRule(current, previous /*null when async*/ ) {

    if (current.ci_count_percent <= 0 || current.ci_count_percent > 100) {
        gs.addErrorMessage(gs.getMessage('CI count percentage should be between 1 and 100. Aborting action!'));
        current.setAbortAction(true);
    }

    var sum = 0;
    var agg = new GlideAggregate('sn_cmdb_ws_ms_data_mismatch_config');
    agg.addAggregate('SUM', 'ci_count_percent');
    agg.query();

    while (agg.next())
        sum += parseInt(agg.getAggregate('SUM', 'ci_count_percent'));

    var totalSum = sum + (current.ci_count_percent - previous.ci_count_percent);
    if (totalSum > 100) {
        gs.addErrorMessage(gs.getMessage('Total sum of CI count percentage for all rows is greater than 100. Aborting action!'));
        current.setAbortAction(true);
    }

})(current, previous);
