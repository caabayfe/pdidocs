function onDisplay(current, g_scratchpad) {
   //This function will be automatically called when this rule is processed.
	var isElse  = current.else_flag == 'true';
	var isError = current.error == 'true';
	var newValue = (isElse ? 'else_flag' : (isError ? 'error' : 'standard'));
	
	current.condition_type = newValue;
}
