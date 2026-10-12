(function calculatedFieldValue(current) {

	// Add your code here
	var version = '';
	if(current.version && !current.version.nil())
		version = ' v'+current.version.version;
	
	return current.number+version;  // return the calculated value

})(current);
