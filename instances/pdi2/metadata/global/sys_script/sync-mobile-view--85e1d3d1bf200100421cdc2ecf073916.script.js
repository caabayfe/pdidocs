if(current.mobile_view_name.nil() && current.device_type.toString() != 'browser')
	current.setValue("mobile_view_name", "Mobile");
else if(current.device_type.toString() == 'browser')
	current.setValue("mobile_view_name", "");
