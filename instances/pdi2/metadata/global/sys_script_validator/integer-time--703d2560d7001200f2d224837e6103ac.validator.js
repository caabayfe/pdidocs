function validate(value) {
	return isDate(value, getIntegerTimeFormat(g_user_date_time_format)) ? true : new GwtMessage().getMessage("Invalid Time. Please use format: {0}", getIntegerTimeFormat(g_user_date_time_format));
}

function getIntegerTimeFormat(dateTimeFormat) {
	var timeFormat = "";
	var timeFormatArr = dateTimeFormat.split(" ");
	if (timeFormatArr.length > 2)
		timeFormat = timeFormatArr[1] + " " + timeFormatArr[2];
	else if (timeFormatArr.length == 2)
		timeFormat = timeFormatArr[1];
	else
		timeFormat = "HH:mm:ss";
	return timeFormat;
}
