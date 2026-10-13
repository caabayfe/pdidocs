gs.info("Starting removeDuplicateStatsRecords");
removeDuplicateStatsRecords();
gs.info("Finished removeDuplicateStatsRecords");

function removeDuplicateStatsRecords() {
	//Since we need to query records based both on category and application, making a list of categories here
	//so that we don't have to run multiple, duplicate queries per application
	var autoCatList = [];
	var autoCatGr = new GlideRecord('automation_error_category');
	autoCatGr.query();
	while (autoCatGr.next())
		autoCatList.push('' + autoCatGr.sys_id);

	var autoAppGr = new GlideRecord('automation_source_application');
	autoAppGr.query();
	while (autoAppGr.next()) {
		for (entry in autoCatList) {
			var category = autoCatList[entry];
			var application = '' + autoAppGr.sys_id;
			var autoCatStatsGr = new GlideRecord('automation_error_category_stats');
			autoCatStatsGr.addQuery('category', category);
			autoCatStatsGr.addQuery('application', application);
			autoCatStatsGr.orderByDesc('sys_updated_on');
			autoCatStatsGr.query();
			var count = autoCatStatsGr.getRowCount() - 1;
			if (count > 0) {
				//We want to keep the first (most recent updated) record and then remove all duplicates afterwards
				autoCatStatsGr.next();
				while (autoCatStatsGr.next())
					autoCatStatsGr.deleteRecord();
				gs.info("Deleted " + count + " record(s) with Category: " + category + " and Application: " + application);
			}
		}
	}
}
