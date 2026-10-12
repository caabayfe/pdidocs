(function(current, action){
	if (typeof current.number != 'undefined' && current.number)
		current.number = ""; // generate a new number
	else if (typeof current.u_number != 'undefined' && current.u_number)
		current.u_number = ""; // generate a new number
	
	return current.insert();
})(current, action);
