(function executeRule(current, previous /*null when async*/ ) {
    // Delete Affected Ci's mtom record before cascade delete to recalculate availability of affected offerings.
    var cmdb_outage_ci_mtom = new GlideRecord('cmdb_outage_ci_mtom');
    cmdb_outage_ci_mtom.addQuery('outage', current.sys_id);
    if (cmdb_outage_ci_mtom.canDelete())
        cmdb_outage_ci_mtom.deleteMultiple();
})(current, previous);
