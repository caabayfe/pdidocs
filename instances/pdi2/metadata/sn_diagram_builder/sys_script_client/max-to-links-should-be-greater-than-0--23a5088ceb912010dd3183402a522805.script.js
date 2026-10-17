function onSubmit(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    } 
    var x = parseFloat(g_form.getValue("to_max_links"));
	
	//Only allowing user to enter Max To Links gretaer than 0
    if (x < 1) {
        g_form.showFieldMsg("to_max_links", "Value of Max To Links should be greater than 0", "error");
		return false;
	}
	return true;
}
