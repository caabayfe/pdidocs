var T2TGlobalUtil = Class.create();
T2TGlobalUtil.prototype = {
    initialize: function() {
		this.SYS_ATF_TEST = 'sys_atf_test';
		this.SYS_ATF_TEST_STEP = 'sys_atf_step';
		this.SYS_SCOPE = 'sys_scope';
		this.SYS_PACKAGE = 'sys_package';
		this.SYS_CREATED_ON = 'sys_created_on';
		this.ACTIVE = 'active';
		this.TEST = 'test';
		this.TEMP_SCOPE_ID = '889ecc488cd84acaa0b25b108698ed5d';
		this.TEST_ORIGIN = "test_origin";
		this.NOW_ASSIST = "now_assist";
		this.SYS_ID = "sys_id";
    },

	setTestScopeAndOrigin: function() {
		var currUserScopeId = gs.getCurrentApplicationId();

		// change test scope to new scope id and mark inactive
		var atfGr = new GlideRecord(this.SYS_ATF_TEST);
		atfGr.addQuery(this.SYS_SCOPE, this.TEMP_SCOPE_ID);
		atfGr.orderByDesc(this.SYS_CREATED_ON);
		atfGr.query();
		if (!atfGr.next())
			throw Error(gs.getMessage('No test in x_snc_t2t_build scope'));
		atfGr.setValue(this.SYS_SCOPE, currUserScopeId);
		atfGr.setValue(this.SYS_PACKAGE, currUserScopeId);
		atfGr.setValue(this.TEST_ORIGIN, this.NOW_ASSIST);
		var testId = atfGr.update();
		if (gs.nil(testId))
			throw Error(gs.getMessage('Updating scope for test with id: {0} failed.', testId));

		// change test step scope to new scope id and mark inactive
		var atfStepGr = new GlideRecord(this.SYS_ATF_TEST_STEP);
		atfStepGr.addQuery(this.TEST, testId);
		atfStepGr.query();
		while (atfStepGr.next()) {
			atfStepGr.setValue(this.SYS_SCOPE, currUserScopeId);
			atfStepGr.setValue(this.SYS_PACKAGE, currUserScopeId);
			// if this fails, should we delete the whole test?
			var testStepId = atfStepGr.update();
			if (gs.nil(testStepId))
				throw Error(gs.getMessage('Updating scope for test step with id: {0} failed.', testStepId));
		}
		return testId;
	},

	setActiveStatusForDeployedTest: function(testId, activeStatus) {
		// mark test with activeStatus
		var atfGr = new GlideRecord(this.SYS_ATF_TEST);
		if (gs.nil(atfGr.get(testId)))
			throw Error(gs.getMessage('Could not find test with id: ' + testId));
		atfGr.setValue(this.ACTIVE, activeStatus);
		if (gs.nil(atfGr.update()))
			throw Error(gs.getMessage('Marking test with id: {0} active failed', testId));
		var atfStepGr = new GlideRecord(this.SYS_ATF_TEST_STEP);
		atfStepGr.addQuery(this.TEST, testId);
		atfStepGr.query();
		while (atfStepGr.next()) {
			atfStepGr.setValue(this.ACTIVE, activeStatus);
			// if this fails, should we delete the whole test?
			var testStepId = atfStepGr.update();
			if (gs.nil(testStepId))
				throw Error(gs.getMessage('Marking test step with id: {0} active failed', testStepId));
		}
	},

	discardTest: function(testId) {
		// discard test steps
		var atfStepGr = new GlideRecord(this.SYS_ATF_TEST_STEP);
		atfStepGr.addQuery(this.TEST, testId);
		atfStepGr.query();
		while (atfStepGr.next()) {
			var testStepId = atfStepGr.getUniqueValue();
			if (!atfStepGr.deleteRecord())
				throw Error(gs.getMessage('Discarding test step with id: {0} failed', testStepId));
		}
		// discard test
		var atfGr = new GlideRecord(this.SYS_ATF_TEST);
		if (gs.nil(atfGr.get(testId)))
			throw Error(gs.getMessage('Could not find test with id: ' + testId));
		if (!atfGr.deleteRecord())
			throw Error(gs.getMessage('Discarding test with id: {0} failed', testId));
	},

    replaceEncodedQuery: function(table, encodedQuery, resolver) {
        if (gs.nil(table) || gs.nil(encodedQuery)) {
            return encodedQuery;
        }

        try {
            // Use GlideQueryString to process the query
            var gqs = new GlideQueryString(table, encodedQuery);
            gqs.deserialize();
            var queryTerms = gqs.getTerms();
            var updatedTerms = [];
            var madeChanges = false;

            for (var i = 0; i < queryTerms.size(); i++) {
                var term = queryTerms.get(i);

                // Extract field, operator, and value
                var field = term.getField();
                var operator = term.getOperator();
                var value = term.getValue();

                if (field !== 'null' && field) {
                    // Resolve the database field name
                    var dbField = resolver(table, field);
                    if (dbField && dbField !== field) {
                        field = dbField;
                        madeChanges = true;
                    }

                    // Reconstruct the term
                    var updatedTerm = field + operator + value;
                    updatedTerms.push(updatedTerm);
                }
            }

            if (madeChanges) {
                var updatedQuery = updatedTerms.join('^');
                this.t2t_logInfo("Updated encoded query: " + updatedQuery);
                return updatedQuery;
            } else {
                this.t2t_logInfo("No changes made to the encoded query.");
                return encodedQuery;
            }
        } catch (err) {
            this.t2t_logError("Exception in _replaceEncodedQuery: " + err.message);
            return encodedQuery;
        }
    },

    t2t_logInfo: function(msg) {
        gs.info("t2tUtil: Info: " + msg);
    },

    t2t_logError: function(msg) {
        gs.error("t2tUtil: Error: " + msg);
    },

    setOriginToNowAssist: function(testId) {
        // change test origin to now assist
        var atfGr = new GlideRecord(this.SYS_ATF_TEST);
		if (gs.nil(atfGr.get(testId)))
			throw Error(gs.getMessage('Could not find test with id: ' + testId));
        atfGr.setValue(this.TEST_ORIGIN, this.NOW_ASSIST);
        if (gs.nil(atfGr.update()))
            throw Error(gs.getMessage('Updating origin for test with id: {0} failed.', testId));
    },

    deployTestXMLs: function(testXML, stepXMLArray) {
        var errorHeader = "Encountered issues during test deployment.";
        try {
            var loader = new GlideLoader();
            loader.loadXML(testXML);
            for (var i = 0; i < stepXMLArray.length; i++) {
                loader.loadXML(stepXMLArray[i]);
            }
        } catch (e) {
            gs.error("Error while loading XML: " + e.message);
            return {
                'succeeded': false,
                'errorHeader': errorHeader,
                'errorDetails': e.message
            };
        }
        try {
            var xmlUtil = new GlideXMLUtil();
            var deployedTestId = xmlUtil.getElementValueByTagName(xmlUtil.parse(testXML), this.SYS_ID);
            if (gs.nil(deployedTestId))
                throw Error("Unable to get sys id from test XML");
            this.setOriginToNowAssist(deployedTestId);
            this.setActiveStatusForDeployedTest(deployedTestId, this.FALSE);
            return {
                'succeeded': true,
                'testId': deployedTestId
            };
        } catch (e) {
            gs.error("Error while changing deployed test origin and active status: " + e.message);
            return {
                'succeeded': false,
                'errorHeader': errorHeader,
                'errorDetails': e.message
            };
        }
    },

    type: 'T2TGlobalUtil'
};
