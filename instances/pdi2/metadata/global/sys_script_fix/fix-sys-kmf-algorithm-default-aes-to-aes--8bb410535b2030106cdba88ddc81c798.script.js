var algoFieldDictionary = new GlideRecord('sys_dictionary');
algoFieldDictionary.addQuery('name', 'sys_kmf_algorithm');
algoFieldDictionary.addQuery('element', 'algorithm');
algoFieldDictionary.addQuery('default_value', 'aes');
algoFieldDictionary.query();
if (algoFieldDictionary.next()) {
	algoFieldDictionary.default_value = 'AES';
	algoFieldDictionary.update();
}
