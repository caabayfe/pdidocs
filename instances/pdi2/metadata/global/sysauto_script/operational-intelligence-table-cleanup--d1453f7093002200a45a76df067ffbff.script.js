cleanTable('sa_metric_map','expiration');
function cleanTable(tableName, fieldToCleanBy) {
		
	var cleanFromEmpty = new GlideDateTime();
	var cleanFromNonEmpty = new GlideDateTime();
	var tableGrEmpty = new GlideRecord(tableName);
	var tableGrNonEmpty = new GlideRecord(tableName);
	var oldPeriodSecEmptyCI = gs.getProperty("sa.metrics.cleanup_empty_ci_age.sec", 10800); // 3 hours
	var oldPeriodSecNonEmptyCI = gs.getProperty("sa.metrics.cleanup_non_empty_ci_age.sec", 259200); // 3 days
	
	try {
		
		gs.info("Operational Intelligence - Table cleanup started for " + tableName + " on field " + fieldToCleanBy + " older than "  + oldPeriodSecEmptyCI + " seconds for empty CI's, and older than " + oldPeriodSecNonEmptyCI + " seconds for non empty ones");
		
		// Clean empty
		cleanFromEmpty.addSeconds((-1)*oldPeriodSecEmptyCI);
		tableGrEmpty.addQuery(fieldToCleanBy, "<", cleanFromEmpty);
		tableGrEmpty.addQuery("active", true);
		tableGrEmpty.addNullQuery('cmdb_ci');
		tableGrEmpty.deleteMultiple();
		
		// Clean non-empty
		cleanFromNonEmpty.addSeconds((-1)*oldPeriodSecNonEmptyCI);
		tableGrNonEmpty.addQuery(fieldToCleanBy, "<", cleanFromNonEmpty);
		tableGrNonEmpty.addQuery("active", true);
		tableGrNonEmpty.deleteMultiple();
		
		
		
		gs.info("Operational Intelligence - Table cleanup ended for " + tableName + " on field " + fieldToCleanBy + " older than " + oldPeriodSecEmptyCI + " seconds for empty CI's, and older than " + oldPeriodSecNonEmptyCI + " seconds for non empty ones");
		
	} catch(e) {
		gs.logError("Operational Intelligence - Table cleanup job failed due to: " + e);
	}
};
