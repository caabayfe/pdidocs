(function() {
	let rollupID = event.parm1;
	let window, startTime, endTime;
	try {
		window = JSON.parse(event.parm2);
		startTime = new GlideDateTime(window[0]);
		endTime = new GlideDateTime(window[1]);
	} catch (parseError) {
		// Exit early if we cannot parse the time range
		let execTime = new GlideDateTime();
		result.setValue("successful", false);
		result.setValue("eval_window_start_ts", execTime);
		result.setValue("eval_window_end_ts", execTime);
		result.setValue("target", rollupID);
		result.setValue("message", parseError);
		result.insert();
		return;
	}

	let result = new GlideRecord("mb_raptor_rollup_result");
	result.initialize();
	let success = false;
	try {
		let rollup = new GlideRecord("mb_raptor_table");
		if (!rollup.get("sys_id", rollupID)) {
			throw new Error("Could not find specified id in rollup table");
		}
		success = sn_clotho.RaptorMetricRollupService.rollup(rollup.target_table, startTime, endTime);
	} catch (error) {
		result.setValue("message", error);
	}
	result.setValue("successful", success);
	result.setValue("eval_window_start_ts", startTime);
	result.setValue("eval_window_end_ts", endTime);
	result.setValue("target", rollupID);
	result.insert();
})();
