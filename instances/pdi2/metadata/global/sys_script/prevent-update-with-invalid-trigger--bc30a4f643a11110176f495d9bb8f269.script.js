(function executeRule(current, previous /*null when async*/ ) {
	var encodedQuery = current.trigger;
	var encodedQueryConditions = encodedQuery.toString().split("\\^");
	for (var conditionNumber = 0; conditionNumber < encodedQueryConditions.length; conditionNumber++) {
		var encodedCondition = encodedQueryConditions[conditionNumber];
		try {
			var trigger_table = 'v_ais_result_improvement_rule_condition_builder_values';
			var qs = new GlideQueryString(trigger_table, encodedCondition);
			qs.deserialize();
			var terms = qs.getTerms();
			for (var i = 0; i < terms.size(); i++) {
				var condition = terms.get(i);
				var ce = new GlideCompositeElement(condition.getField(), trigger_table);
				if (ce.getTargetED().isTimeType()) {
					current.setAbortAction(true);
					gs.addErrorMessage(gs.getMessage('AIS Rule cannot be saved because of an invalid trigger field'));
					break;
				}
			}
		} catch (e) {
			gs.addInfoMessage(gs.getMessage('There was an error validating trigger Field: {0}. Make sure that the trigger field does not contain any date/time fields', [e]));
		}

	}

	var response = new AisQueryRuleConditionUtils().validateEncodedQueryStringWithParam(encodedQuery);
	if (response != "ok") {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('AIS Rule cannot be saved with an invalid trigger condition'));
		gs.addErrorMessage(response);
	}
	return;

})(current, previous);
