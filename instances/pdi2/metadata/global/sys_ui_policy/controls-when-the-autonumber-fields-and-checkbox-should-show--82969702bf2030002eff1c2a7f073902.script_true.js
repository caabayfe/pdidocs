function onCondition() {
	var autoNumber = g_scratchpad.auto_number;
	var autoNumberAccess = g_scratchpad.auto_number_access;
	//if there is already a autonumber, hide the checkbox
	//if the session doesn't have write access to the record, hide the checkbox
    if (autoNumber || !autoNumberAccess) {
        gel("auto_number_box").style.display = "none";
    }
    else{
        g_form.setDisplay("number_ref.prefix", false);
        g_form.setDisplay("number_ref.number", false);
        g_form.setDisplay("number_ref.maximum_digits", false);
    }
}
