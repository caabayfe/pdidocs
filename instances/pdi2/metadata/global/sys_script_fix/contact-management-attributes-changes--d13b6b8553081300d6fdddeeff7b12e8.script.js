//Run only on instances who have started below london
if (!pm.isActive('com.snc.best_practice.incident.london')) {
	var dictionaryContactGr = new GlideRecord('sys_dictionary');
	dictionaryContactGr.addQuery('name', 'contact');
	dictionaryContactGr.addQuery('element', 'responsibility');
	dictionaryContactGr.setWorkflow(false);
	dictionaryContactGr.query();
	if (dictionaryContactGr.next()) {
		dictionaryContactGr.setValue('reference_qual', "javascript:new ContactManagementUtilSNC().getRefQualForResponsibilityContactTable(current)");
		dictionaryContactGr.setValue('mandatory', false);
		dictionaryContactGr.update();
	}

	//reference qual for responsibility column in contact_definition should get responsibility for table = incident or table = none
	var contactDefGr = new GlideRecord('sys_dictionary');
	contactDefGr.addQuery('name', 'contact_definition');
	contactDefGr.addQuery('element', 'responsibility');
	contactDefGr.setWorkflow(false);
	contactDefGr.query();
	if (contactDefGr.next()) {
		contactDefGr.setValue('reference_qual', "javascript:'sys_idIN'+new SNC.ContactManagementEngine().getResponsibilities('incident',current.type).join(',')");
		contactDefGr.update();
	}

	SNC.DictionaryAttribute.set('contact', 'table', 'base_table', 'comm_plan');
	SNC.DictionaryAttribute.set('contact', 'table', 'allow_public', 'true');
	SNC.DictionaryAttribute.set('contact_responsibility', 'table', 'base_table', 'task');
	SNC.DictionaryAttribute.set('contact_responsibility', 'table', 'allow_public', 'true');
}
