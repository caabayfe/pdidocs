(function (step, stepResult, assertionObject) {
  assertionObject.executeStep = function(step, stepResult) {
	var alh = new ATFListHelper(step.inputs);
	var isRelatedList = alh.isRelatedList();

    var APPLYING_FILTER_MESSAGE = isRelatedList ?
		"Applying the filter '{0}' to the '{1}' related list on the '{2}' form":
		"Applying the filter '{0}' to the '{1}' list";
    var APPLY_FILTER_SUCCESS_MESSAGE = isRelatedList ?
		"Successfully applied the following filter to the '{0}' related list on the '{1}' form, with {2} record(s) matching:\n{3}" :
		"Successfully applied the following filter to the '{0}' list, with {1} record(s) matching:\n{2}";
    var APPLY_FILTER_NO_RECORDS_MATCH_FAILURE = "FAILURE: Expected no records to match this filter but {0} record(s) matched:\n{1}";
    var APPLY_FILTER_RECORDS_MATCH_FAILURE = "FAILURE: Expected at least one record to match this filter but no records matched:\n{0}";
	var APPLY_FILTER_EXACTLY_ONE_MATCH_FAILURE = "FAILURE: Expected exactly one record to match this filter but {0} record(s) matched:\n{1}";
	var messageMap = new GwtMessage().getMessages([APPLYING_FILTER_MESSAGE, APPLY_FILTER_SUCCESS_MESSAGE, APPLY_FILTER_NO_RECORDS_MATCH_FAILURE, APPLY_FILTER_RECORDS_MATCH_FAILURE, APPLY_FILTER_EXACTLY_ONE_MATCH_FAILURE]);

	if (isRelatedList)
		g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[APPLYING_FILTER_MESSAGE], step.inputs.filter_conditions, step.inputs.related_list, step.inputs.table));
	else
		g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[APPLYING_FILTER_MESSAGE], step.inputs.filter_conditions, step.inputs.related_list));

	/**
	 * Applies a filter to the given list object, then calls validate() to assert against the assert_type
	 */
	function applyFilter(gList) {
		return alh.applyFilter(gList, step.inputs.filter_conditions, step.inputs.formatted_condition)
			.then(validate);
	}

	/**
	 * Callback to be called when the list has refreshed -- performs the final validation(s)
	 */
	function validate(gList) {
		// Used to resolve/reject the promise chain
		var q = g_ui_testing_util.q();

		// If there was at least one match set the output variable
		var records = gList._getRecords();
		if (records && records[0] && records[0].sys_id)
			stepResult.outputs.first_record = records[0].sys_id;

		// Assert on the assert type, if one was specified
		if (step.inputs.assert_type === "no_records_match_filter" && gList.totalRows > 0)
			return q.reject(formatMessage(messageMap[APPLY_FILTER_NO_RECORDS_MATCH_FAILURE], gList.totalRows, step.inputs.formatted_condition));
		else if (step.inputs.assert_type === "records_match_filter" && gList.totalRows <= 0)
			return q.reject(formatMessage(messageMap[APPLY_FILTER_RECORDS_MATCH_FAILURE], step.inputs.formatted_condition));
		else if (step.inputs.assert_type === "exactly_one_match" && gList.totalRows !== 1)
			return q.reject(formatMessage(messageMap[APPLY_FILTER_EXACTLY_ONE_MATCH_FAILURE], gList.totalRows, step.inputs.formatted_condition));

		if (isRelatedList)
			return q.when(formatMessage(messageMap[APPLY_FILTER_SUCCESS_MESSAGE], step.inputs.list_label, step.inputs.table, gList.totalRows, step.inputs.formatted_condition));
		else
			return q.when(formatMessage(messageMap[APPLY_FILTER_SUCCESS_MESSAGE], step.inputs.list_label, gList.totalRows, step.inputs.formatted_condition));
	}

	// Run the test function
	alh.executeTestFunction(applyFilter, step, stepResult);

  };
  assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
