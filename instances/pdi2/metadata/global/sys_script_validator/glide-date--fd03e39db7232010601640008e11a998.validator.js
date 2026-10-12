function validate(value) {
	//Fix for DEF0197478

    // empty fields are still valid dates
    if (!value)
        return true;
    // Default case: we have global g_user_date_format defined
	if (typeof g_user_date_format !== 'undefined') {
		//yyyy-MM-dd should be valid if the sys_property is yyyy-MM-dd HH:mm:ss
		//yyyy-MM-dd HH:mm:ss should be valid if the sys_property is yyyy-MM-dd
		var newValue = value + ' 00:00:00';
		var dateFormatOk = (g_user_date_time_format !== 'undefined') ? isDate(value, g_user_date_time_format) : false;
		return isDate(value, g_user_date_format) ||
			isDate(newValue, g_user_date_format) ||
			dateFormatOk ||
			getMessage("Invalid Date");
	}
	   // Edge case: we can always try guessing if g_user_date_format is not defined
    return parseDate(value) !== null || getMessage("Invalid Date");

}
