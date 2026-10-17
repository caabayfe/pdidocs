/*
 * When a name is entered into the field, it is checked
 * to see whether a user or vendor prefix should be added
 * to the value.  The vendor prefix is passed through
 * the scratchpad. The display business rule, "Create Vendor Prefix",
 * is responsible for filling in the vendor prefix.
 */

function onChange(control, oldValue, newValue, isLoading) {
	if(isLoading)
		return;
	if (newValue == '')
		return;
	
	var prefix = g_scratchpad.vendorPrefix
	var s = newValue;
	
	s = s.toLowerCase();
	s = s.replace(/[^a-zA-Z0-9_]/g, '_');
	
	if (prefix == '') {
		// we are MAINT, no prefix, if there is a prefix on the string, then error
		// user needs to impersonate the vendor or user
		if ( s.startsWith('u_') || s.startsWith('x_')) {
			alert('Prefix is not allowed for MAINT users.  Impersonate a non-admin user to make a table with the u_ (or vendor x_*_) prefix');
			return;
		}
	} else {
		// test to see if the string starts with our prefix.
		if ( !s.startsWith(prefix) ) {
			// it has a different prefix or no prefix, just add ours
			s = prefix + s;
		}
	}
	
	if (s != newValue)
		g_form.setValue("name", s);
}
