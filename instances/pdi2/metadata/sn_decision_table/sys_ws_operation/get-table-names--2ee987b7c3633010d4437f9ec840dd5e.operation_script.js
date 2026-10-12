(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var tables_output = [];
    var rotatedTables = getRotatedTables();
    var queryParams = request.queryParams;

    if (!queryParams.sysparm_transaction_scope) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('sysparm_transaction_scope query parameter is required.');
    }

    function addAdditionalQueries(gr) {       
        if (queryParams.only_in_scope && queryParams.only_in_scope[0] === 'true')
            gr.addQuery('sys_scope', queryParams.sysparm_transaction_scope);
        if (queryParams.only_out_of_scope && queryParams.only_out_of_scope[0] === 'true')
            gr.addQuery('sys_scope', '!=', queryParams.sysparm_transaction_scope);
        if (queryParams.order_by && typeof queryParams.order_by[0] === 'string')
            gr.orderBy(queryParams.order_by[0]);
        if (queryParams.limit && typeof queryParams.limit[0] === 'string')
            gr.setLimit(queryParams.limit[0]);
        if (queryParams.search_query && typeof queryParams.search_query[0] === 'string') {
            gr.addEncodedQuery(queryParams.search_query[0]);
        }
    }

    function isExcludedRotation(name) {
        return rotatedTables.indexOf(name) > -1;
    }

    function getRotatedTables() {
        var rotatedList = [];
        var rotations = [];
        var rotatedTable = new GlideRecord("sys_table_rotation");
        rotatedTable.query();

        while (rotatedTable.next())
            rotatedList.push(rotatedTable.getValue("name"));

        var rotatedExtension = new GlideRecord("sys_table_rotation_schedule");
        rotatedExtension.query();

        while (rotatedExtension.next()) {
            if (rotatedList.indexOf(rotatedExtension.getValue("table_name")) === -1)
                rotations.push(rotatedExtension.getValue("table_name"));
        }
        return rotations;
    }

    function startsWith(str, word) {
        return str.lastIndexOf(word, 0) === 0;
    }

    function shouldExcludeTable(tableName) {
        if (isExcludedRotation(tableName))
            return true;

        if (
            startsWith(tableName, 'v_') ||
            startsWith(tableName, 'sysx_') ||
            startsWith(tableName, 'var__') ||
            startsWith(tableName, 'ts_')

        )
            return true;

        return false;
    }

    var tablesGR = new GlideRecord('sys_db_object');
    addAdditionalQueries(tablesGR);
    tablesGR.query();

    while (tablesGR.next()) {
        var tableName = tablesGR.getValue('name');

        if (shouldExcludeTable(tableName))
            continue;

        var table = {
            name: tablesGR.getValue('name'),
            sys_id: tablesGR.getUniqueValue(),
            label: tablesGR.getDisplayValue('label'),
        };
        tables_output.push(table);
    }

    response.setBody(tables_output);
    response.setStatus(200);

})(request, response);
