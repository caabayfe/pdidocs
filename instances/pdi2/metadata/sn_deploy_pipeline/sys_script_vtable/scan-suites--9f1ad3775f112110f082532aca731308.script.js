(function executeQuery(v_table, v_query) {
        // Main API:
        //    v_table.addRow({ ... }) - adds a row to the result set

        // There are also query helper methods
        //    v_query.getEncodedQuery() - returns encoded querystring
        //    v_query.getCondition(field) - returns encoded querystring for the given field (includes field name, operator, and value)
        //    v_query.getParameter(field) - returns parameter for the given field (only includes value for equality conditions)
        //    v_query.isGet() - returns whether the query is a single get by sys_id
        //    v_query.getSysId() - returns parameter for sys_id field
        //    v_query.isTextSearch() - returns whether the query contains a text query parameter
        //    v_query.getTextSearch() - returns text search query parameter (internal field name 123TEXTQUERY321)
        //    v_query.getFirstRowWanted() - returns the first row to include
        //    v_query.getLastRowWanted() - returns the last row to include

        // Note: You must define sys_id for each row so that forms and lists for this table work properly

        // Your code goes here
        // v_table.addRow({...})

        var responses = ScanSuiteService.getScansFromPipelineEnvs();

        responses.forEach(function(response) {
                response.result.suites.forEach(function(suite) {
                    suite.instance_url = response.instanceURL;
                    v_table.addRow(suite);
                });
        });
})(v_table, v_query);
