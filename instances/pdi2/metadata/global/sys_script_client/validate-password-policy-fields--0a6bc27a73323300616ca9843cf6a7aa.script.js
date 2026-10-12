function onSubmit() {
    // Mimimum Password Length can not be less than 8
    var minPwdLength = g_form.getIntValue('minimun_password_length');
	var pwdStrength = g_form.getIntValue('password_strength');
	if(pwdStrength != 70) {
		if (minPwdLength < 8) {
			g_form.showFieldMsg('minimun_password_length', getMessage('The minimum password length can not be less than 8.'), 'error');
			return false;
		}

		var maxPwdLength = g_form.getIntValue('maximum_password_length');
		if (minPwdLength >= maxPwdLength) {
			g_form.showFieldMsg('minimun_password_length', getMessage('The minimum password length can not be greater than the maximum password length and there must be a difference of 5 or more.'), 'error');
			return false;
		}
		
		if ((maxPwdLength - minPwdLength) < 5) {
			g_form.showFieldMsg('maximum_password_length', getMessage('Difference between minimum and maximum password length must be 5 or more.'), 'error');
			return false;
		}

		if (pwdStrength == 50) {
			var minUpperCase = g_form.getIntValue('minimum_uppercase_characters');
			var minLowerCase = g_form.getIntValue('minimum_lowercase_characters');
			var minNumeric = g_form.getIntValue('minimum_numeric_characters');
			var minSpecialChar = g_form.getIntValue('minimum_special_characters');
			var sum = minUpperCase + minLowerCase + minNumeric + minSpecialChar;
			if (sum > maxPwdLength) {
				var msg = formatMessage(getMessage('The maximum password length must not be less than the sum ({0}) of minimum required character fields.'), sum);
				g_form.showFieldMsg('maximum_password_length', msg, 'error');
				return false;
			}
		}
	}

}
