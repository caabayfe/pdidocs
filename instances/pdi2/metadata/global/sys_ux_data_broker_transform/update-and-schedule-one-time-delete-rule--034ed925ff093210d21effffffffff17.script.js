function transform(input) {
	const rule = input.rule;
	return new OnetimeDeleteRuleManager().updateAndScheduleRule(rule);
}
