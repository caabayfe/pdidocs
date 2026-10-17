(function process(/*ResolverEnvironment*/ env) {

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'var_dictionary');
	dictGr.addQuery('element', 'hint');
	dictGr.query();

	if (dictGr.next()) {
		var maxLength = dictGr.getValue('max_length');
		return maxLength;
	} else {
		return null;
	}

})(env);
