function onSubmit(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    } 
    var x = parseFloat(g_form.getValue("from_max_links"));
	//Not allowing user to enter Max From Links less than 1
    if (x < 1) {
        g_form.showFieldMsg("from_max_links", "Value of Max From Links should be greater than 0", "error");
		return false;
	}
	return true;

}
