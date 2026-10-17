function addQualifiers() {
	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'cmdb_model');
	dictGr.addQuery('element', 'manufacturer');
	dictGr.query();
	dictGr.next();
	dictGr.setValue('use_reference_qualifier', 'simple');
	dictGr.setValue('reference_qual', 'manufacturer=true^EQ');
	dictGr.update();
}

addQualifiers();
