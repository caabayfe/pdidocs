(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const hashId = request.queryParams["hashed_user_id"][0];
        const userGr = new GlideRecordSecure(UXAConstants.TABLE.USER);
        userGr.addQuery('hashed_user_id', hashId);
        userGr.query();
        if (!userGr.next()) {
            throw new Error('ACL_VIOLATION');
        }

        const userId = userGr.getValue('sys_id');

        const gr = new GlideRecord(UXAConstants.TABLE.ANALYTICS_CUSTOM_USER_PROPERTIES);
        gr.query();
        const tableFieldsMap = [];
        while (gr.next()) {
            const tableName = gr.table_name.name.toString();
            const fieldName = gr.field_name.element.toString();
            tableFieldsMap.push({
                table: tableName,
                field: fieldName,
                fieldDisplayValue: gr.getDisplayValue('field_name'),
                query: tableName === 'sys_user' ? `sys_id=${userId}` : `user=${userId}`
            });
        }

        const result = [];
        tableFieldsMap.forEach(({
            table,
            field,
            fieldDisplayValue,
            query
        }) => {
            const tableGr = new GlideRecordSecure(table);
            tableGr.addEncodedQuery(query);
            tableGr.query();
            const items = [];
            while (tableGr.next()) {
                items.push(tableGr.getDisplayValue(field));
            }
            result.push({
                label: fieldDisplayValue,
                value: items,
            });
        });

        return result;
    } catch (e) {
        var error = new sn_ws_err.ServiceError();
        if (e.message === 'ACL_VIOLATION') {
            error.setStatus(403);
            error.setMessage('No data found');
            error.setDetail('No data found or user does not have access');
        } else {
            error.setMessage('Technical error');
        }

        return error;
    }
})(request, response);
