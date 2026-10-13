(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var reportDefId = request.pathParams.report_def_id;
    gs.debug('[DISC] cancel_report: Called with reportDefId=' + reportDefId);

    var reportDefRec = new GlideRecord('sn_nlu_discovery_report_definition');
    reportDefRec.get(reportDefId);

    if (!reportDefRec.isValidRecord()) {
        var errorMsg = 'Cannot load report definition with ID ' + reportDefId;
        gs.warn('[DISC] cancel_report: ' + errorMsg);
        return {
            error: errorMsg
        };
    }

    // Load the solution definition
    var solutionDefId = reportDefRec.getValue('solution_definition');
    var solutionDefRec = new GlideRecord('ml_capability_definition_base');
    solutionDefRec.get(solutionDefId);

    if (!solutionDefRec.isValidRecord()) {
        errorMsg = 'Cannot load solution definition with ID ' + solutionDefId;
        gs.warn('[DISC] cancel_report: ' + errorMsg);
        return {
            error: errorMsg
        };
    }

    var solutionName = solutionDefRec.getValue('solution_name');
    var solution = new sn_nlu_discovery.IntentDiscoveryUtil().getSolution(solutionName);

    if (gs.nil(solution)) {
        errorMsg = 'Cannot load solution with name ' + solutionName;
        gs.warn('[DISC] cancel_report: ' + errorMsg);
        return {
            error: errorMsg
        };
    }

    var status = solution.getLatestVersion().getStatus();
    status = status ? JSON.parse(status) : status;
    gs.debug('[DISC] Solution training job status before cancel is ' + status + ', status.hasJobEnded=' + JSON.stringify(status.hasJobEnded));

    if (status && status.hasJobEnded !== 'true') {
        gs.debug('[DISC] Cancelling solution training job ' + solutionName);
        solution.cancelTrainingJob();
    }

    status = solution.getLatestVersion().getStatus();
    gs.debug('[DISC] Solution training job final status is ' + status);

    status = status ? JSON.parse(status) : status;

    if (status && status.state === 'solution_cancelled' || status.state === 'timed_out') {
		var nextStatus = 'solution_cancelled';
		if (status.state === 'solution_cancelled') {
			// Get the status of previous non cancelled solution and set it.
			var allSolutions = new GlideRecord('ml_solution');
			allSolutions.addQuery('ml_capability_definition', reportDefRec.getValue('solution_definition'));
			allSolutions.addQuery('state', '!=', 'solution_cancelled');
			allSolutions.orderByDesc('sys_updated_on');
			allSolutions.query();
			if (allSolutions.next()) {
				nextStatus = allSolutions.getValue('state');
			}
		}
		reportDefRec.status = nextStatus;
		reportDefRec.update();	
    }

    return { 
		value: reportDefRec.getValue('status'), 
		display_value: reportDefRec.getDisplayValue('status')
	};
})(request, response);
