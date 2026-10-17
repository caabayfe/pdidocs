(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	validateRuleScript();
	validateStrengthScript();
	
	function validateRuleScript() {
		var ruleScript;
		if (current.isValidField('password_rule_script')) {
			ruleScript = current.password_rule_script;
		}
		var rules = eval(ruleScript);
		for(var i=0; i<rules.length; i++) {
			if(!JSUtil.notNil(rules[i].hint) || JSUtil.type_of(rules[i].hint) != "string") {
				gs.addErrorMessage(gs.getMessage("Password policy rule hint {0} should be a string and cannot be empty.", rules[i].hint));
			}
			if(!JSUtil.notNil(rules[i].regex) || JSUtil.type_of(rules[i].regex) != "string") {
				gs.addErrorMessage(gs.getMessage("Password policy rule regex {0} should be a string and cannot be empty.", rules[i].regex));
			}
		}
	}
	
	function validateStrengthScript() {
		var strengthScript;
		if (current.isValidField('password_strength_script')) {
				strengthScript = current.password_strength_script;
		}
		var strengthOptions = eval(strengthScript);
		var keys = Object.keys(strengthOptions);

		// Number of strength script options should be 4.
		if(keys.length != 4) {
			gs.addErrorMessage(gs.getMessage("Do not modify the number of strength script options."));
			return;
		}


		//Keys of the strength script options should not be modified.
		for(var i=0; i<keys.length; i++) {
			if((keys[i] != "minimum_number_of_characters" && keys[i] != "unique_character_count_starts_after" && keys[i] != "number_of_similar_ascending_descending_count" && keys[i] != "minimum_special_characters")) {
				gs.addErrorMessage(gs.getMessage("Do not modify the keys in strength script options {0}.", keys[i]));
				return;
			}
		}
	}

})(current, previous);
