(function process(env) {
	return new MobileUiRuleRepository().deleteMobileUiRule(env.getArguments()['id']);
})(env);
