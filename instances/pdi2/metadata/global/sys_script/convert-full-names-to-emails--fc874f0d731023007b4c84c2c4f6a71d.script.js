(function executeRule(current, previous /*null when async*/) {
	var emailFieldValues = current.getValue("email");
	if (gs.nil(emailFieldValues))
		return;
	else {
		var fieldValuesArray = emailFieldValues.split(",");
		for (var i = 0 ; i < fieldValuesArray.length; i++) {
			var sysUserGr = new GlideRecord("sys_user");
			if (sysUserGr.get(fieldValuesArray[i]))
				fieldValuesArray[i] = sysUserGr.getValue("email");
			
		}
		current.setValue("email", fieldValuesArray.toString());
	}

})(current, previous);
