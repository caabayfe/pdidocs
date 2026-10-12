(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const table = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TABLE, null);
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID, null);
        const query = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.QUERY, null);
        const limit = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.LIMIT, 20);
        const requestedDisplayField = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TABLE_DISPLAY_FIELD, null);
        const requestedValueField = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TABLE_ID_FIELD, null);
        const searchText = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SEARCH_TEXT, null);
        let returnFields = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.FIELDS, []);
        returnFields = typeof returnFields === 'string' ? returnFields.split(',') : returnFields;

        const tableGR = new GlideRecordSecure(table);
        if (!tableGR.isValid()) {
            return apiHelper.respondUnsuccessfully('Failed to get reference values');
        }
        const displayField = requestedDisplayField && tableGR.isValidField(requestedDisplayField) ? requestedDisplayField : tableGR.getDisplayName();
        let tableQuery;
        if (query) {
            tableQuery = tableGR.addEncodedQuery(query);
        }
        if (sysId) {
            tableGR.addQuery('sys_id', sysId);
        } else {
            if (displayField && searchText) {
                tableQuery = tableGR.addQuery(displayField, 'CONTAINS', searchText);
            } else if (searchText) {
                tableQuery = tableGR.addQuery(`123TEXTQUERY321=${searchText}`);
            }
            if (returnFields && returnFields.length > 0) {
                returnFields.forEach((fieldName) => {
                    tableQuery = tableQuery.addOrCondition(fieldName, "CONTAINS", searchText);
                });
            }
        }
        tableGR.setLimit(limit ?? 20);
        if(displayField){
            tableGR.orderBy(displayField);
        }
        tableGR.query();
        const results = [];
        while (tableGR.next()) {
            const result = {
                value: requestedValueField && tableGR.isValidField(requestedValueField) ? tableGR.getValue(requestedValueField) : tableGR.getUniqueValue(),
                display_value: tableGR[displayField].getDisplayValue()
            };
            (returnFields ?? []).forEach((fieldName) => {
                if (tableGR.isValidField(fieldName)) {
                    result[fieldName] = tableGR[fieldName].getDisplayValue();
                }
            });
            results.push(result);
        }
        apiHelper.respondSuccesfully(results);
    });

})(request, response);
