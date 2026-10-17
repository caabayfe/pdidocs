function validate(value) { 
    	var re = /(((ftp|http|https):\/\/)|(www\.))([-\w\.\/#$\?=+@&%_:;]+)/gi;
    	if (value == null || value == "")
        		return true;
	if (re.test(value)) { 
		return true;
	}
	return false;
}
