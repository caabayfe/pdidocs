(function executeRule(current, previous /*null when async*/) {

	var langId = previous.id;
	
	var choice = new GlideRecord('sys_choice');
	choice.addQuery('name', 'sys_user');
	choice.addQuery('element', 'preferred_language');
	choice.addQuery('language', 'en');
	choice.addQuery('value', langId);
	choice.query();
	if (choice.next()) {
		choice.deleteRecord();
	}

})(current, previous);
