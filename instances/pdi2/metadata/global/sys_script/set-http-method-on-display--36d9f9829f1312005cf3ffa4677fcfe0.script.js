(function executeRule(current, previous /*null when async*/) {

	// http method can be null, if we upgrade from a previous release or with executing existing bussiness rule
    // which does not set http method. In those cases if function name is a valid http method we use it
	// if the function name is invalid some random option shown in UI.
    if ((!current.isValidField('http_method') || current.http_method.nil()) &&
           !current.function_name.nil()){
		var fName = current.function_name;
		if (fName == 'put' || fName == 'get' || fName == 'delete' || fName == 'post' || fName == 'head')
		    current.http_method = current.function_name;
		else
            //This means an existing record with invalid http method as function name.
			gs.addErrorMessage("Invalid record. If HTTP method is not present, Name should be an HTTP method.");
	}
})(current, previous);
