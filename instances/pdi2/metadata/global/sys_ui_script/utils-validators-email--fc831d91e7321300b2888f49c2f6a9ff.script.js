(function() {
	var isDigit = function(thchar) {
		return (thchar >= '0' && thchar <= '9');
	};

	var isAlpha = function(thchar) {
		return (thchar >= 'a' && thchar <= 'z\uffff')
			|| (thchar >= 'A' && thchar <= 'Z\uffff') || thchar == '_';
	};

	var isAlphaNum = function(thchar) {
		return isAlpha(thchar) || isDigit(thchar);
	};

	var containsOnlyChars = function(validChars, sText) {
		if (!sText) { return true; } // blank is fine

		for (var i = 0; i < sText.length; i++) {
			var c = sText.charAt(i);
			if (validChars.indexOf(c) === -1) { return false; } // not a match
		}

		return true;
	};

	var containsPeriodsSideBySide = function(sText) {
		var pattern = /\.\./g;
		return pattern.test(sText);
    };

	var isEmailValidWithReason = function(value) {
		var localPartChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%*/?|^{}`~&'+-=_.";
		var domainChars =    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.";

		// break into local part and domain
		if (value.indexOf("@") === -1) { return "missing @ sign"; }

		var s = value.split("@");
		if (s.length != 2) { return "too many at signs"; }

		// check the local part of the address
		if (!containsOnlyChars(localPartChars, s[0])) { return "invalid character before the at sign"; }
		if (s[0].length < 1) { return "at least one character must be before the at sign"; }
		if (s[0].substr(0,1) === ".") { return "period cannot be the first character"; }
		if (s[0].substr(s[0].length-1,1) === ".") { return "period cannot be the last character before the at sign"; }

		// check the domain part of the address
		if (!containsOnlyChars(domainChars, s[1])) { return "invalid character after the at sign"; }

		var periodIndex = s[1].indexOf(".");
		if (periodIndex === -1) { return "missing period after the at sign"; }
		if (periodIndex === 0) { return "period cannot be the first character after the at sign"; }

		//check whether periods are used side by side
		if(containsPeriodsSideBySide(s[0])) {return "invalid usage of periods before @ sign"; }
		if(containsPeriodsSideBySide(s[1])) {return "invalid usage of periods after @ sign"; }

		var periods = s[1].split(".");
		var lastPeriod = periods[periods.length-1];
		if (lastPeriod.length < 1) { return "must be at least 1 character after the last period"; }
		if (!isAlphaNum(s[1].substr(0,1))) { return "the first character after the at sign must be alphanumeric"; }
		if (!isAlphaNum(s[1].substr(s[1].length-1,1))) { return "the last character must be alphanumeric"; }

		return ""; // address is OK
	};

	var isEmailValid = function(value) {
		return isEmailValidWithReason(value) === "";
	};

	return {
		isEmailValid: isEmailValid
	};
});
