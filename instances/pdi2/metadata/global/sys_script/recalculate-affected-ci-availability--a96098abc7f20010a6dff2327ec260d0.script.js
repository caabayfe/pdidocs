function processAffectedCis(outage) {
	var cmdb_outage_ci_mtom = new GlideRecord('cmdb_outage_ci_mtom');
	cmdb_outage_ci_mtom.addQuery('outage', outage.sys_id);
	cmdb_outage_ci_mtom.query();

	while(cmdb_outage_ci_mtom.next()){
		// Affected Ci is not the outage Ci, do not need to calculate twice
		if (cmdb_outage_ci_mtom.ci_item.toString() !== outage.cmdb_ci.toString()) {
			var currentData = {
				cmdb_ci: cmdb_outage_ci_mtom.ci_item,
				outage: current
			};
			var previousData = {
				cmdb_ci: cmdb_outage_ci_mtom.ci_item,
				outage: previous
			};
		
        new global.RecalculateAvailability().processOutageChange(currentData, previousData, current.operation());
      }
	}
}

(function executeRule(current, previous /*null when async*/) {
	processAffectedCis(current);
})(current, previous);
