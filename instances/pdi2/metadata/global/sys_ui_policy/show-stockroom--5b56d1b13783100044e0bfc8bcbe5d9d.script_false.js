function onCondition() {
    g_form.setMandatory('stockroom', false);
	// DEF0246844 - Stockroom shouldn't be displayed if filter conditions are not met 
	g_form.setDisplay('stockroom', false);
}
