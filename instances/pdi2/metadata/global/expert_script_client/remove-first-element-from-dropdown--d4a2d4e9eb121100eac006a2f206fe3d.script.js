/*
 * Removes the "System (TIMEZONE)" element(s) from the options
 * as the select variable cannot evaluate the javascript 
 * expression for the option of value "NULL_OVERRIDE"
 */
function onChange(control, oldValue, newValue, isLoading) {
	for (var i = 0; i < control.options.length; i++)
		if(control.options[i].value == "NULL_OVERRIDE")
			control.options[i] = null;
}
