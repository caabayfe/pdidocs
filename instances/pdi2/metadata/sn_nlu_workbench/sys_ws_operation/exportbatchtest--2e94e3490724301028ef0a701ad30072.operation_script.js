(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var tables = NLUWorkbenchConstants.tables;

    var data = request.pathParams;
    var query = request.queryParams;

    try {
        if (data.executionId) {
            var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
            if (!executionGr.get(data.executionId))
                throw new Error(gs.getMessage('Execution does not exists!'));

            var testName = executionGr.test_run_definition.test_set.name;
            var testVersion = executionGr.sys_created_on.getDisplayValue();
            var fileName = (testName && testVersion) ? testName + '_' + testVersion + '.csv' : 'batch_test_results_' + data.executionId + '.csv';

            response.setContentType('application/csv');
            response.setStatus(200);
            response.setHeader('Content-Disposition', 'attachment;filename="' + fileName + '"');
            var writer = response.getStreamWriter();

            var batchTestExporter = new sn_nlu_workbench.NLUBatchTestExportUtil();
            batchTestExporter.writeToStream(data.executionId, query.filters, writer, fileName);

        } else {
            return new sn_ws_err.BadRequestError('Invalid input data provided');
        }
    } catch (e) {
        response.setStatus(400);
        var message = e.message;
        return {
            status: 'failure',
            message: e.message
        };
    }

})(request, response);
