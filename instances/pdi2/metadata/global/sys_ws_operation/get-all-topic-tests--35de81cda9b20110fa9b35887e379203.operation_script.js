(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var TOPIC_ID_VARIABLE = 'db7cbc6229220110fa9b4ca2fb4c9db9';

	var topicsByStep = {};

	var stepIds = [], topicIds = [];
	var varGr = new GlideRecord('sys_variable_value');
	varGr.addQuery('document', 'sys_atf_step');
	varGr.addQuery('variable', TOPIC_ID_VARIABLE);
	varGr.query();
	var stepId, topicId;
	while (varGr.next())  {
		stepId = varGr.getValue('document_key');
		topicId = varGr.getValue('value');
		stepIds.push(stepId);
		topicIds.push(topicId);
		topicsByStep[stepId] = topicId;
	}

	var stepsByTest = {};
	var testIds = [];
	var stepGr = new GlideRecord('sys_atf_step');
	stepGr.addQuery('sys_id', 'IN', stepIds);
	stepGr.query();
	var testId;
	while (stepGr.next()) {
		stepId = stepGr.getUniqueValue();
		testId = stepGr.getValue('test');
		testIds.push(stepGr.getValue('test'));
		stepsByTest[testId] = stepId;
	}

	var tests = [];
	var testsById = {};
	var testGr = new GlideRecord('sys_atf_test');
	testGr.addQuery('sys_id', 'IN', testIds);
	testGr.orderBy('name');
	testGr.query();
	var test, id, name, created;
	while (testGr.next()) {
		id = testGr.getValue('sys_id');
		name = testGr.getValue('name');
        created = testGr.getValue('sys_created_on');
		test = { id: id, name: name, topicId: topicsByStep[stepsByTest[id]||[]], createdOn: created };
		tests.push(test);
		testsById[id] = test;
	}

	var testResultIds = [];
	var testResultsGr = new GlideRecord('sys_atf_test_result');
	testResultsGr.addQuery('test', 'IN', testIds);
	testResultsGr.orderByDesc('sys_created_on');
	testResultsGr.query();
	while (testResultsGr.next()) {
		id = testResultsGr.getValue('test');
		if (!testsById[id].testResultId) {
			testsById[id].testResultId = testResultsGr.getValue('sys_id');
			testsById[id].lastRunOn = testResultsGr.getValue('sys_created_on');
			testsById[id].status = testResultsGr.getValue('status');
			testsById[id].failedSummary = testResultsGr.first_failing_step.summary.getValue();
			testResultIds.push(testsById[id].testResultId);
		}

	}

	var totalStepsGa = new GlideAggregate('sys_atf_step');
	totalStepsGa.addQuery('test', 'IN', testIds);
	totalStepsGa.groupBy("test");
	totalStepsGa.addAggregate("COUNT");
	totalStepsGa.query();
	while (totalStepsGa.next()) {
		id = totalStepsGa.getValue('test');
		testsById[id].totalSteps = totalStepsGa.getAggregate("COUNT");
	}

	var totalStepsPassedByResultId = {};
	var totalStepsPassedGa = new GlideAggregate('sys_atf_test_result_step');
	totalStepsPassedGa.addQuery('test_result', 'IN', testResultIds);
	totalStepsPassedGa.addQuery('status', 'success');
	totalStepsPassedGa.groupBy("test_result");
	totalStepsPassedGa.addAggregate("COUNT");
	totalStepsPassedGa.query();
	while(totalStepsPassedGa.next()) {
		var resultId = totalStepsPassedGa.getValue("test_result");
		totalStepsPassedByResultId[resultId] = totalStepsPassedGa.getAggregate('COUNT');
	}

	var topicGr = new GlideRecord('sys_cs_topic');
	topicGr.addQuery('sys_id', 'IN', topicIds);
	topicGr.query();
	var topics = {};
	while (topicGr.next()) {
		topics[topicGr.getUniqueValue()]= {};
		topics[topicGr.getUniqueValue()].topicName = topicGr.getDisplayValue('cb_topic_id');
		topics[topicGr.getUniqueValue()].cbTopicId = topicGr.getValue('cb_topic_id');
		topics[topicGr.getUniqueValue()].topicLastPublishedOn = topicGr.getValue('last_published_on');
	}

	var queueGr = new GlideRecord('sys_cs_atf_queue');
	var selectedTest;
	queueGr.addQuery('status', '!=', 'complete');
	queueGr.query();
	while (queueGr.next()) {
		selectedTest = testsById[queueGr.getValue('test')];
		if (selectedTest) {
			selectedTest.isQueued = true;
		}
	}

	var index;
	for (index = 0; index < tests.length; index++) {
		tests[index].topicName = topics[tests[index].topicId].topicName || '';
		tests[index].cbTopicId = topics[tests[index].topicId].cbTopicId;
		tests[index].topicLastPublishedOn = topics[tests[index].topicId].topicLastPublishedOn || '';
		tests[index].lastRunOn = testsById[tests[index].id].lastRunOn || '';
		tests[index].status = testsById[tests[index].id].status;
		tests[index].failedSummary = testsById[tests[index].id].failedSummary;
		tests[index].totalSteps = testsById[tests[index].id].totalSteps;
		tests[index].totalStepsPassed = totalStepsPassedByResultId[testsById[tests[index].id].testResultId];
		tests[index].isQueued = testsById[tests[index].id].isQueued;
	}

	response.setStatus(200);
	response.setBody(tests);

})(request, response);
