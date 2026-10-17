function dynamicUserCreation(current, value) {
  var y = value.split(" ");
  var lname = "";
		
  if (y.length == 2 ) {
	var fname = y[0].toLowerCase();
	lname = y[1].toLowerCase();
			
	current.first_name = fname.charAt(0).toUpperCase() + fname.substring(1,fname.length);
	current.last_name = lname.charAt(0).toUpperCase() + lname.substring(1,lname.length);
  } else if (y.length == 1){
	lname = y[0].toLowerCase();
	current.last_name = lname.charAt(0).toUpperCase() + lname.substring(1,lname.length);
  } else { // more than 2
	var fname = y[0].toLowerCase();
			
	current.first_name = fname.charAt(0).toUpperCase() + fname.substring(1,fname.length);
			
	var long_last_name = "";
	for (i = 1; y.length > i; i++) {
		lname = y[i].toLowerCase();
		long_last_name += lname.charAt(0).toUpperCase() + lname.substring(1,lname.length);
				
		if (y.length - 1 > i) { // dont add the last space
			long_last_name += " ";
		}
	}
  	current.last_name = long_last_name;
  }
		
  current.name = current.first_name + " " + current.last_name;
		
  var fname = current.first_name.toString();
		
  current.user_name = fname.charAt(0).toLowerCase() + lname;

  return current.insert();
}
