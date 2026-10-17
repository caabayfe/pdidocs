var todayDatetime = new GlideDateTime();

removeOldRecords(todayDatetime);
removeTodayRecords(todayDatetime);
createSnapShot(todayDatetime);

// Remove old records, over 12 whole months old.
function removeOldRecords(todayDatetime) {
	var gdt = new GlideDateTime();
	gdt.setNumericValue(todayDatetime.getNumericValue());
	gdt.addMonths(-12);
	gdt.setDayOfMonthLocalTime(1);

	var gr = new GlideRecord('license_detail_metric_history');
	gr.addQuery('sys_created_on', '<', gdt.getDate() + ' 00:00:00');
	gr.query();
	while (gr.next()) {
		gr.deleteRecord();
	}
}

// Delete any records from today. In case this is run multiple times on the same day.
function removeTodayRecords(todayDatetime) {
	var minDatetime = new GlideDateTime();
	minDatetime.setNumericValue(todayDatetime.getNumericValue());
	minDatetime.subtract(minDatetime.getTime());

	var maxDatetime = new GlideDateTime();
	maxDatetime.setNumericValue(minDatetime.getNumericValue());
	maxDatetime.addDays(1);

	var gr = new GlideRecord('license_detail_metric_history');
	gr.addQuery('sys_created_on', '>=', minDatetime.getValue());
	gr.addQuery('sys_created_on', '<', maxDatetime.getValue());
	gr.query();
	while (gr.next()) {
		gr.deleteRecord();
	}
}

// Copy records from st_license_detail_metric to license_detail_metric_history.
// We are storing daily snapshots to be able to display a time series graph of allocated user
// entitlements for licensing.  PA could not be used in this case because PA copies data
// directly from the database table, and since the source table is a 'remote table' there is
// no data in the actual table.
function createSnapShot(todayDatetime) {
	var gru = new GlideRecordUtil();
	var source = new GlideRecord('st_license_detail_metric');
	source.query();
	
	while (source.next()) { 
		var fields = gru.getFields(source);
		var target = new GlideRecord('license_detail_metric_history');
		target.initialize();

		// Copy all of the source table fields.
		for (var i = 0; i < fields.length; i++) {
			target[fields[i]] = source.getValue(fields[i]);
		}
		target.insert();
	}
}
