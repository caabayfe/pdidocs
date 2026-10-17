(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var tableDescriptor = new GlideTableDescriptor(current.target_table);
	var targetFieldtype = tableDescriptor.getElementDescriptor(current.target_field).getInternalType();
	if (targetFieldtype == 'glide_time')
		current.date_format = "HH:mm:ss";
	else
		current.date_format = "yyyy-MM-dd HH:mm:ss";

})(current, previous);
