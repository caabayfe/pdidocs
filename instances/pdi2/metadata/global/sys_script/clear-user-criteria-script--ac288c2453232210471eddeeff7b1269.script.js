(function executeRule(current, previous /*null when async*/) {

	var userCriteriaScriptValue = "/** Scripted User Criteria is not cached, and evaluated everytime, so performance is dependent on the script.\n * Populate `answer` with true/false or evaluate to true/false\n * The script is evaluated in the scope the user criteria is defined\n * Don't use `current` in the script or populate the variable\n * Don't use `gs.getUser()` or  `gs.getUserID()`, \n * instead use `user_id` which contains the user sys_id against whom the evaluation is happening.\n */\n(function() {\n\tanswer = true;\n})();";

	if(current.getValue('script').replace(/\s/g, '') == userCriteriaScriptValue.replace(/\s/g, '')) {
		current.script = '';
	}

})(current, previous);
