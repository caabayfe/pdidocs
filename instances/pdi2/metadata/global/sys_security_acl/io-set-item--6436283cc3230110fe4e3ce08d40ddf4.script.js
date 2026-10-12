var answer = canReadCatItemAndVariableSet();

function canReadCatItemAndVariableSet() {
	if (JSUtil.nil(current.sc_cat_item) || !current.sc_cat_item.getRefRecord().isValidRecord()
		|| !current.sc_cat_item.getRefRecord().canRead()
		|| JSUtil.nil(current.variable_set) || !current.variable_set.getRefRecord().isValidRecord()
		|| !current.variable_set.getRefRecord().canRead())
		return false;
	return true;
}
