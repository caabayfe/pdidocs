var KBAnswerFieldsValidationAjax = Class.create();
KBAnswerFieldsValidationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /**
     * Check if a field in a table has a reference field
     * @return {String} JSON response with validation result
     */
    validateFieldReference: function() {
        var tableName = this.getParameter('table_name');
        var fieldName = this.getParameter('field_name');

        if (!tableName || !fieldName) {
            return this._createResponse(false, 'Missing required parameters', null);
        }

        // Special case for sys_id field
        if (fieldName == 'sys_id' && this._tableBelongsToSysUser(tableName)) {
            return this._createResponse(true, 'sys_id field is valid for sys_user tables', {
                field: fieldName,
                reference: 'sys_user',
                isInherited: true
            });
        }

        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.addQuery('element', fieldName);
        gr.addQuery('internal_type', "reference");
        gr.query();

        if (gr.next()) {
            var reference = gr.getValue('reference');
            var isValid = JSUtil.notNil(reference) ? true : false;
            return this._createResponse(isValid,
                isValid ? 'Field has valid reference' : 'Field does not have reference', {
                    field: fieldName,
                    reference: reference,
                    isInherited: false
                }
            );
        } else {
            return this._createResponse(false, 'Field not found in table', null);
        }
    },

    /**
     * Internal method to check if table belongs to sys_user hierarchy
     * @param {String} tableName - Name of the table to check
     * @return {Boolean} true if table extends sys_user
     */
    _tableBelongsToSysUser: function(tableName) {
        if (tableName == 'sys_user') return true;

        var tableGr = new GlideRecord('sys_db_object');
        tableGr.addQuery('name', tableName);
        tableGr.query();

        if (tableGr.next()) {
            var extendsTableId = tableGr.getValue('super_class');
            var visited = {}; // Prevent infinite loops

            while (extendsTableId != '' && !visited[extendsTableId]) {
                visited[extendsTableId] = true;

                var extendsTableGr = new GlideRecord('sys_db_object');
                extendsTableGr.addQuery('sys_id', extendsTableId);
                extendsTableGr.query();

                if (!extendsTableGr.next()) {
                    return false;
                }

                if (extendsTableGr.getValue('name') === 'sys_user') {
                    return true;
                }

                extendsTableId = extendsTableGr.getValue('super_class');
            }
        }
        return false;
    },

	/**
     * Check if a table has any fields that reference sys_user
     * @return {String} JSON response with validation result
     */
    checkTableHasReference: function() {
        var tableName = this.getParameter('table_name');

        if (!tableName) {
            return this._createResponse(false, 'Missing table name parameter', null);
        }

        var hasReference = false;
        var userFields = [];

        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.query();

        while (gr.next()) {
            var reference = gr.getValue('reference');
            if (JSUtil.notNil(reference)) {
                hasReference = true;
                userFields.push({
                    element: gr.getValue('element'),
                    label: gr.getValue('column_label') || gr.getValue('element'),
                    type: gr.getValue('internal_type')
                });
            }
        }

        return this._createResponse(hasReference,
            hasReference ? 'Table has fields that has a reference' : 'Table does not have any fields that has a reference', {
                table: tableName,
                hasReference: hasReference,
                userFields: userFields,
                fieldCount: userFields.length
            }
        );
    },

    /**
     * Create standardized JSON response
     * @param {Boolean} success - Whether the operation was successful
     * @param {String} message - Response message
     * @param {Object} data - Additional data to include
     * @return {String} JSON response string
     */
    _createResponse: function(success, message, data) {
        var response = {
            success: success,
            message: message,
            data: data
        };
        return JSON.stringify(response);
    },

    type: 'KBAnswerFieldsValidationAjax'
});
