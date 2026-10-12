(function process(env) {
	return new MobileUiRuleRepository().saveMobileUiRuleAction(env.getArguments().mobileUiRuleAction);
})(env);
