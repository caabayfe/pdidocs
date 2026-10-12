//default number and maximum_digits so that default is also done for update
if (!current.number.hasValue()) {
	current.number = 0;
	var td1 = new GlideTableDescriptor("sys_number");
	if (td1) {
		var defaultNumber = td1.getElementDescriptor("number").getDefault();
		if (defaultNumber)
			current.number = defaultNumber;
	}
}

if (!current.maximum_digits.hasValue()) {
	current.maximum_digits = 7;
	var td2 = new GlideTableDescriptor("sys_number");
	if (td2) {
		var defaultMax = td2.getElementDescriptor("maximum_digits").getDefault();
		if (defaultMax)
			current.maximum_digits = defaultMax;
	}
}

if (current.maximum_digits > 15) {
	current.maximum_digits = 15;
	gs.addInfoMessage(gs.getMessage("Number of digits cannot be greater than 15"));
}

//Make sure table name is a valid table
if (current.category) {
	var gr = new GlideRecord(current.category);
	if (!gr.isValid()) {
		current.setAbortAction(true);
		var errMsg = gs.getMessage("The table {0} is invalid.", current.category);
		current.category.setError(errMsg);
		gs.addErrorMessage(errMsg);
	}
}
