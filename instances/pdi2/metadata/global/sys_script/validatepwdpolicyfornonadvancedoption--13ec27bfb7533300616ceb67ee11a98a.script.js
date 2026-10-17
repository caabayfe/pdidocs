(function executeRule(current, previous /*null when async*/ ) {
    var minimun_password_length = current.minimun_password_length;
    var maximum_password_length = current.maximum_password_length;
    var minimum_uppercase_characters = current.minimum_uppercase_characters;
    var minimum_lowercase_characters = current.minimum_lowercase_characters;
    var minimum_numeric_characters = current.minimum_numeric_characters;
    var minimum_special_characters = current.minimum_special_characters;
    var whitelisted_special_characters = current.whitelisted_special_characters;

    var policyScript;
    if (current.isValidField('password_policy_script')) {
        policyScript = current.password_policy_script;
    }
    var options = eval(policyScript);
    if (options) {
        if (options['minimun_password_length'] != undefined)
            minimun_password_length = options['minimun_password_length'];
        if (options['maximum_password_length'] != undefined)
            maximum_password_length = options['maximum_password_length'];
        if (options['minimum_uppercase_characters'] != undefined)
            minimum_uppercase_characters = options['minimum_uppercase_characters'];
        if (options['minimum_lowercase_characters'] != undefined)
            minimum_lowercase_characters = options['minimum_lowercase_characters'];
        if (options['minimum_numeric_characters'] != undefined)
            minimum_numeric_characters = options['minimum_numeric_characters'];
        if (options['minimum_special_characters'] != undefined)
            minimum_special_characters = options['minimum_special_characters'];
    }

    // valiidate script options
    if (minimun_password_length < 8 || minimun_password_length > 100) {
        gs.addErrorMessage(gs.getMessage("Minimum password length should be in range of: [{0}, {1}]", [8, 100]));
		current.setAbortAction(true);
        return;
    }
    if (maximum_password_length < 8 || maximum_password_length > 100) {
        gs.addErrorMessage(gs.getMessage("Maximum password length should be in range of: [{0}, {1}]", [8, 100]));
		current.setAbortAction(true);
        return;
    }
	
	if(maximum_password_length - minimun_password_length < 5){
		gs.addErrorMessage(gs.getMessage("Difference between minimum and maximum password length must be 5 or more", [8, 100]));
		current.setAbortAction(true);
        return;
	}
	
    if (minimum_uppercase_characters < 0 || minimum_uppercase_characters > 10) {
        gs.addErrorMessage(gs.getMessage("Minimum uppercase character(s) should be in range of: [{0}, {1}]", [0, 10]));
		current.setAbortAction(true);
        return;
    }
    if (minimum_lowercase_characters < 0 || minimum_lowercase_characters > 10) {
        gs.addErrorMessage(gs.getMessage("Minimum lowercase Character(s) should be in range of: [{0}, {1}]", [0, 10]));
		current.setAbortAction(true);
        return;
    }
    if (minimum_numeric_characters < 0 || minimum_numeric_characters > 10) {
        gs.addErrorMessage(gs.getMessage("Minimum numeric character(s) should be in range of: [{0}, {1}]", [0, 10]));
		current.setAbortAction(true);
        return;
    }
    if (minimum_special_characters < 0 || minimum_special_characters > 10) {
        gs.addErrorMessage(gs.getMessage("Minimum special character(s) should be in range of: [{0}, {1}]", [0, 10]));
		current.setAbortAction(true);
        return;
    }
    var tempSum = parseInt(minimum_lowercase_characters) + parseInt(minimum_uppercase_characters) + parseInt(minimum_numeric_characters) + parseInt(minimum_special_characters);
	var sumStr = String(tempSum);
	var sum = sumStr.split(".")[0];
	
    if (sum > minimun_password_length) {
        gs.addErrorMessage(gs.getMessage("The minimum password length must not be less than the sum ({0}) of minimum required character fields.", sum));
		current.setAbortAction(true);
        return;
    }
    if (sum > maximum_password_length) {
        gs.addErrorMessage(gs.getMessage("The maximum password length must not be less than the sum ({0}) of minimum required character fields.", sum));
		current.setAbortAction(true);
        return;
    }

})(current, previous);
