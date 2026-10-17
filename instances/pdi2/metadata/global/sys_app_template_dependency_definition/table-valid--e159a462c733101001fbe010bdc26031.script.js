//is a specific table valid?
(function(input) {
	if (!input.hasOwnProperty("table_name"))
		return false;
	
	return GlideTableDescriptor.isValid(input.table_name);
})(input);
