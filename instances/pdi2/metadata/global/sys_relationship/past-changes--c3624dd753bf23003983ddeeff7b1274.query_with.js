(function refineQuery(current, parent) {
    var allCis = saListCisForIndicators(parent.sys_id);
    current.addQuery("cmdb_ci", "IN", allCis);
    current.addEncodedQuery("work_start<javascript:gs.minutesAgoStart(0)^work_endISNOTEMPTY^work_startRELATIVEGT@dayofweek@ago@5^EQ");
})(current, parent);
