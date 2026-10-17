(function process(env) {
	return new MobileUiRuleRepository().saveMobileUiRule(env.getArguments().mobileUiRule);
})(env);
