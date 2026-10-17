(function process(env) {
	return new MobileUiRuleRepository().deleteMobileUiRuleAction(env.getArguments()['id']);
})(env);
