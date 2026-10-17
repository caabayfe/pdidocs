(function executeStep(inputs, outputs, stepResult, timeout) {
    var mandatoryVariableMessage = "{0} was not specified";
	if (gs.nil(inputs.table)) {
		stepResult.setOutputMessage(gs.getMessage(mandatoryVariableMessage, 'Table'));
		stepResult.setFailed();
		return;
	}
	outputs.table = inputs.table;
	if (gs.nil(inputs.field_values)) {
	    stepResult.setOutputMessage(gs.getMessage(mandatoryVariableMessage, 'Conditions'));
	     stepResult.setFailed();
	     return;
	}
	var assertType = inputs.assert_type;
	// set to preserve existing functionality for tests created before assert types were added
	if (!assertType)
		assertType = 'records_match_query';

	var userFriendlyConditions = new global.ATFStepDescriptionGenerator().getConditionDescription(inputs.table, inputs.field_values);
	var query;
	if (inputs.enforce_security)
		query = new GlideRecordSecure(inputs.table);
	else
		query = new GlideRecord(inputs.table);
	var counter = 0;
	while (counter <= timeout) {
		query.initialize();
		query.addEncodedQuery(inputs.field_values);
		query._query();

		if (query._next() && assertType != 'no_records_match_query') {
			stepResult.setOutputMessage(gs.getMessage("Successfully found {0} {1} records matching query:\n{2}",
												  [query.getRowCount(),
												   inputs.table,
												   userFriendlyConditions]));
			stepResult.setSuccess();
			outputs.table = inputs.table;
			outputs.first_record = query.getUniqueValue();
			return;
		}
		if (query.getRowCount() == 0 && assertType == 'no_records_match_query') {
			outputs.table = inputs.table;
			stepResult.setOutputMessage(gs.getMessage("Successfully confirmed there are no records matching query:\n{0}",
									userFriendlyConditions));
			stepResult.setSuccess();
			return;
		}
		counter++;
		sn_atf.AutomatedTestingFramework.waitOneSecond();
	}

	// timeout exceeded
	if (assertType != 'no_records_match_query') {
		stepResult.setOutputMessage(gs.getMessage("FAILURE: No records matching query:\n{0}",
									userFriendlyConditions));
		stepResult.setFailed();
		return;
	}

	if (assertType == 'no_records_match_query') {
		stepResult.setOutputMessage(gs.getMessage("FAILURE: Found {0} {1} records matching query:\n{2}",
											  [query.getRowCount(),
											   inputs.table,
											   userFriendlyConditions]));
		stepResult.setFailed();
	}
}(inputs, outputs, stepResult, timeout));
