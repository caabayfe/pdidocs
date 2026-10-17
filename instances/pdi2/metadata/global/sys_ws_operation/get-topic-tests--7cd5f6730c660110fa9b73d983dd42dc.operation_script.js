(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var TOPIC_ID_VARIABLE = 'db7cbc6229220110fa9b4ca2fb4c9db9';

	var topicId = request.pathParams.topicId;

	var stepIds = [];
	var varGr = new GlideRecord('sys_variable_value');
	varGr.addQuery('document', 'sys_atf_step');
	varGr.addQuery('value', topicId);
	varGr.addQuery('variable', TOPIC_ID_VARIABLE);
	varGr.query();
	while (varGr.next())  {
		stepIds.push(varGr.getValue('document_key'));
	}

	var testIds = [];
	var stepGr = new GlideRecord('sys_atf_step');
	stepGr.addQuery('sys_id', 'IN', stepIds);
	stepGr.query();
	while (stepGr.next()) {
		testIds.push(stepGr.getValue('test'));
	}

	var tests = [];
	var testGr = new GlideRecord('sys_atf_test');
	testGr.addQuery('sys_id', 'IN', testIds);
	testGr.orderBy('name');
	testGr.query();
	var test, id, name;
	while (testGr.next()) {
		id = testGr.getValue('sys_id');
		name = testGr.getValue('name');
		test = { id: id, name: name };
		tests.push(test);
	}

	response.setStatus(200);
	response.setBody(tests);

})(request, response);
