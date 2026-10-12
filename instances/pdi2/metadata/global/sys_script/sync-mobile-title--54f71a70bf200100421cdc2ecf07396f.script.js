if (current.mobile_title.nil() && current.device_type.toString() != 'browser')
	current.mobile_title = current.title;
else if (current.device_type.toString() == 'browser')
	current.mobile_title = "";
