function onChange(control, oldValue, newValue, isLoading) {
	if (!isLoading) {
	
		// get the value the user has selected for the all_day shift variable
		var allDay = (newValue == "Yes");
		
		// if the shift is all day then set the time component of the shift_start variable
		// to be 00:00:00 and hide the shift_end field	
		if (allDay){
			var inputFld = gel("IO:b5f96a55bf1211003f07e2c1ac073907");
			var date = inputFld.value.substring(0, inputFld.value.indexOf(" "));
			inputFld.value = date + " 00:00:00";
			
			inputFld = gel("IO:3f3aaa55bf1211003f07e2c1ac0739d2");
			inputFld.value = date + " 23:59:59";
		} 
	
		// hide or show the shift_end variable depending on the
		// all_day variable value
		g_form.setVisible("shift_end", !allDay);
	}
}
