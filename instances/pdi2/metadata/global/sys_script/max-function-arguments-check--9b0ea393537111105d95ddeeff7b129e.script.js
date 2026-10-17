
        (function executeRule(current, previous) {
	var totalArgs = parseInt(current.args_count);
	if (current.extensible_args)
		totalArgs += parseInt(current.additional_args_count);
	var sysLimit = parseInt(gs.getProperty("com.glide.formula.function.max_args", 255));
	if (totalArgs > sysLimit) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Formula function arguments (minimum required + maximum additional) count cannot be more than {0}",[sysLimit]));
	}
})(current, previous);
