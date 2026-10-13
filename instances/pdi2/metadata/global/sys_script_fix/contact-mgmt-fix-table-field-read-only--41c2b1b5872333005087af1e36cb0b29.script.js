//Run only on instances who have started below london
if (!pm.isActive('com.snc.best_practice.incident.london')) {
	var dictionaryContactRespGr = new GlideRecord('sys_dictionary');
	dictionaryContactRespGr.addQuery('name', 'contact_responsibility');
	dictionaryContactRespGr.addQuery('element', 'table');
	dictionaryContactRespGr.setWorkflow(false);
	dictionaryContactRespGr.query();
	if (dictionaryContactRespGr.next()) {
		dictionaryContactRespGr.setValue('read_only', false);
		dictionaryContactRespGr.update();
	}

	var dictionaryContactGr = new GlideRecord('sys_dictionary');
	dictionaryContactGr.addQuery('name', 'contact');
	dictionaryContactGr.addQuery('element', 'table');
	dictionaryContactGr.setWorkflow(false);
	dictionaryContactGr.query();
	if (dictionaryContactGr.next()) {
		dictionaryContactGr.setValue('read_only', false);
		dictionaryContactGr.update();
	}
}
