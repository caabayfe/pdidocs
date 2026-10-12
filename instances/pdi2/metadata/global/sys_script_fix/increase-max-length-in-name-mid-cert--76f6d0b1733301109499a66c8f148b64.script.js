var dictionaryGR = new GlideRecord('sys_dictionary');
dictionaryGR.addQuery('name','mid_cert_check_policy');
dictionaryGR.addQuery('element','name');
dictionaryGR.query();

if (dictionaryGR.next()) {
	dictionaryGR.setValue('max_length','255');
	dictionaryGR.update();
	gs.info("Max_length of 'name' field in mid_cert_check_policy table increased to 255");
}
