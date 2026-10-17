var ATFCodeCoverageBridge = Class.create();
ATFCodeCoverageBridge.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
        var name = this.getParameter("sysparm_name");
        if (name == "persistCodeCoverage")
            return this.persistCodeCoverage(this.getParameter('sysparm_code_coverage'));
        else if (name == "checkTestResultState")
            return this.checkTestResultState(this.getParameter('sysparm_test_result_id'));
        else if (name == "getBatchTrackerId")
            return this.getBatchTrackerId(this.getParameter('sysparm_test_result_id'));
        else if (name == "aggregateTestCodeCoverage")
            return this.aggregateTestCodeCoverage(this.getParameter('sysparm_test_result_id'));
        else if (name == "aggregateTestSuiteCodeCoverage")
            return this.aggregateTestSuiteCodeCoverage(this.getParameter('sysparm_test_suite_result_id'));
        else if (name == "areBatchTrackersComplete")
            return this.areBatchTrackersComplete(this.getParameter('sysparm_test_result_id'));
    },

	/**
     * Frontend code coverage bridge to backend persistence
	 *
     */
	persistCodeCoverage: function(codeCoverage) {
	    sn_atf.ATFClientSideCodeCoverage.persistFrontendTraces(codeCoverage);
	},

	/**
	 * Check if test result is in a valid state for code coverage aggregation
	 * Returns JSON with canAggregate (boolean) and state (string)
	 */
	checkTestResultState: function(testResultId) {
		var gr = new GlideRecord('sys_atf_test_result');
		if (!gr.get(testResultId)) {
			return JSON.stringify({
				canAggregate: false,
				state: 'not_found'
			});
		}
		
		var state = gr.getValue('status');
		// Block aggregation if test is pending, waiting, running, or paused
		var invalidStates = ['pending', 'waiting', 'running', 'paused'];
		var canAggregate = (invalidStates.indexOf(state) === -1);
		
		return JSON.stringify({
			canAggregate: canAggregate,
			state: state || 'unknown'
		});
	},

	getBatchTrackerId: function(testResultId) {
		return sn_atf.ATFClientSideCodeCoverage.getBatchTrackerId(testResultId);
	},

	aggregateTestCodeCoverage: function(testResultId) {
		return sn_atf.ATFCodeCoverage.aggregateTestCodeCoverage(testResultId);
	},

	aggregateTestSuiteCodeCoverage: function(testSuiteResultId) {
		return sn_atf.ATFCodeCoverage.aggregateTestSuiteCodeCoverage(testSuiteResultId);
	},

	areBatchTrackersComplete: function(testResultId) {
		return String(sn_atf.ATFClientSideCodeCoverage.areBatchTrackersComplete(testResultId));
	},

    type: 'ATFCodeCoverageBridge'
});
