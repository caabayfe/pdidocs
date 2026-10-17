(function executeRule(current, previous /*null when async*/) {

	var contactSourceGr = new GlideRecord('sys_on_call_contact_source');
	contactSourceGr.addActiveQuery();
	contactSourceGr.addQuery('sys_id', '!=', current.getUniqueValue());
	contactSourceGr.addQuery('table', current.table + '');
	contactSourceGr.addQuery('source_type', current.source_type + '');
	
	if (current.table + '' != 'sys_user') {
		contactSourceGr.addQuery('user_field', current.user_field + '');
	}
	
	if (current.source_type + '' == 'email')
		contactSourceGr.addQuery('email_source', current.email_source + '');
	else if (current.source_type + '' == 'phone_number')
		contactSourceGr.addQuery('phone_number_source', current.phone_number_source + '');
	
	contactSourceGr.query();
	if (contactSourceGr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Contact source on this field already exists"));
		current.setAbortAction(true);
	}

})(current, previous);
