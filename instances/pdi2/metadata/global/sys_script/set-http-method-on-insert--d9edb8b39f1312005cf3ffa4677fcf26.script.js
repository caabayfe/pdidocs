(function executeRule(current, previous /*null when async*/) {

	if (!current.isValidField('http_method') || current.http_method.nil()){
		var fName = current.function_name;
		if (fName == 'get' || fName == 'put' || fName == 'post' || fName == 'delete' || fName == 'head')
			current.http_method = current.function_name;
		else
			current.setAbortAction(true);
	}

})(current, previous);
