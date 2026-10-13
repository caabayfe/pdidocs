
// Delay to allow late-arriving metrics to be written before rollup
var ROLLUP_DELAY_MS = 1000 * 60 * 5; // 5 minutes

// Limit on rollup query window before dividing it into multiple events
var MAXIMUM_QUERY_WINDOW_MS = 1000 * 60 * 60 * 24; // 1 day

// Queries the raptor tables for tables with a rollup spec
function getTables() {
	var tables = new GlideRecord('mb_raptor_table');
	tables.orderBy("target_table");
	tables.addNotNullQuery("mb_raptor_rollup_spec");
	tables.addQuery("mb_raptor_rollup_spec.active", true);
	tables.query();
	return tables;
}

// Checks for outstanding events for this table to prevent rescheduling
function hasOutstanding(id) {
	var events = new GlideRecord("sysevent");
	events.addQuery("name", "mb_rollup");
	events.addQuery("parm1", id);
	events.addQuery("state", "NOT IN", "processed,error,transferred"); // Not in a terminal state
	events.query();
	return events.hasNext();
}

function getLatestSuccessTime(id, tables, now, rollupMillis) {
	// Start at most recent successful end time if present,
	// otherwise start from unix epoch
	var results = new GlideRecord("mb_raptor_rollup_result");
	results.addQuery("target", id);
	results.addQuery("successful", true);
	results.addNotNullQuery("eval_window_end_ts");
	results.orderByDesc("eval_window_end_ts");
	results.query();
	var start;
	if (results.next()) {
		start = new GlideDateTime(results.getValue("eval_window_end_ts"));
		return start;
	} else {
		// Query parent table for earliest timestamp
		var parentTable = new GlideRecord("mb_raptor_table");
		var sourceTable = tables.mb_raptor_rollup_spec.source_table;
		var startNumeric;
		var startAligned;
		var offset = Math.max(MAXIMUM_QUERY_WINDOW_MS, rollupMillis);
		if (!sourceTable.nil() && parentTable.get(sourceTable)) {
			var query = new sn_clotho.SqlBuilder()
						.select("timestamp")
						.from(parentTable.target_table)
						.orderBy("timestamp")
						.limit(1)
						.execute();
			var rows = JSON.parse(query.getRowsJson());
			if (rows.length > 0 && rows[0].length > 0 && rows[0][0] != null) {
				// Start one day before the earliest data point if present
				// [0][0] for first column of first row in result
				start = new GlideDateTime(rows[0][0]);
				startNumeric = start.getNumericValue() - offset;
				startAligned = startNumeric - (startNumeric % rollupMillis);
				start.setNumericValue(startAligned);
				return start;
			}
		}
		// Start one day before now if no data is present
		startNumeric = now.getNumericValue() - offset;
		startAligned = startNumeric - (startNumeric % rollupMillis);
		start = new GlideDateTime();
		start.setNumericValue(startAligned);
		var startUnaligned = new GlideDateTime();
		startUnaligned.setNumericValue(startNumeric);
		return start;
	}
}

function alignEndTime(now, rollupMillis) {
	// Align current time to rollup precision for end time
	var nowNumeric = now.getNumericValue() - ROLLUP_DELAY_MS;
	var endAligned = nowNumeric - (nowNumeric % rollupMillis);
	var end = new GlideDateTime();
	end.setNumericValue(endAligned);
	return end;
}

// Returns true if the table is waiting for the parent table's rollup to compvare before it can run
function waitingForParentRollup(tables, end) {
	// Check if this rollup has a parent rollup that needs to compvare first
	var parentTable = new GlideRecord("mb_raptor_table");
	var sourceTable = tables.mb_raptor_rollup_spec.source_table;
	if (!sourceTable.nil() && parentTable.get(sourceTable)) {
		// Only check parent rollup status if source table is itself a rollup table
		if (!parentTable.mb_raptor_rollup_spec.nil()) {
			// Source table is a rollup table - verify its rollup has compvared
			var parentResults = new GlideRecord("mb_raptor_rollup_result");
			parentResults.addQuery("target", parentTable.sys_id);
			parentResults.addQuery("successful", true);
			parentResults.addNotNullQuery("eval_window_end_ts");
			parentResults.orderByDesc("eval_window_end_ts");
			parentResults.query();

			if (parentResults.next()) {
				var parentEndTime = new GlideDateTime(parentResults.getValue("eval_window_end_ts"));
				// Parent's evaluation window end must be >= this rollup's aligned end time
				if (parentEndTime.getNumericValue() < end.getNumericValue()) {
					gs.debug('Parent rollup not complete for table ' + tables.target_table +
						'. Parent end: ' + parentEndTime + ', Required end: ' + end);
					return true;
				}
			} else {
				// No successful parent rollup found, skip this rollup
				gs.debug('No successful parent rollup found for table ' + tables.target_table);
				return true;
			}
		}
		// If source is a base table (no rollup spec), no dependency check needed
		return false;
	}
}

// Scheduling logic
(function() {
	// Query all raptor tables with rollup spec
	var tables = getTables();
	if (!tables.hasNext()) {
		gs.debug('No rollup tables found.');
		return;
	}

	var now = new GlideDateTime();
	var tableCount = 0;
	while (tables.next()) {
		try {
			if (tables.target_table.nil() || tables.timestamp_precision.nil())
				continue;
			// If there is an outstanding event for this record, don't make a new one
			// Between checking and queueing, another instance could queue the same event. This is low risk since the script runs periodically
			var id = tables.sys_id;
			if (hasOutstanding(id))
				continue;
	
			// Convert from nanos to millis
			var rollupMillis = Math.floor(tables.timestamp_precision / 1000000);
			var start = getLatestSuccessTime(id, tables, now, rollupMillis);
			var end = alignEndTime(now, rollupMillis);

			// Only run if parent table is finished rolling up
			if (waitingForParentRollup(tables, end)) {
				continue;
			}
			// Only run if the aligned end time is after the start
			if (end.getNumericValue() <= start.getNumericValue()) {
				continue;
			}

			// Don't breakup rollups if they intend to rollup larger windows
			var windowLimit = Math.max(MAXIMUM_QUERY_WINDOW_MS, rollupMillis);
			var startMillis = start.getNumericValue();
			var endMillis = end.getNumericValue();
			var windowMillis = endMillis - startMillis;
			if (windowMillis <= windowLimit) {
				// Less than either a day of data or one rollup table point to process, 
				// do it all in one batch
				gs.eventQueue("mb_rollup", tables, id, JSON.stringify([start, end]));
				tableCount++;
			} else {
				// Schedule each window separately, with up to the last day of data potentially being
				// scheduled separately after these compvare
				var windows = Math.floor(windowMillis / windowLimit);
				for (var i = 0; i < windows; i++) {
					var windowStart = startMillis + (i * windowLimit);
					var startGlideTime = new GlideDateTime();
					startGlideTime.setNumericValue(windowStart);

					var windowEnd = startMillis + ((i + 1) * windowLimit);
					var endAligned = windowEnd - (windowEnd % rollupMillis);
					var alignedEnd = new GlideDateTime();
					alignedEnd.setNumericValue(endAligned);
					gs.eventQueue("mb_rollup", tables, id, JSON.stringify([startGlideTime, alignedEnd]));
				}
				tableCount++;
			}
			
		} catch (e) {
			gs.warn('Error scheduling rollup for table ' + tables.target_table + ': ' + e);
		}
	}
	gs.debug("Submitted rollup jobs for " + tableCount + " tables");
})();
