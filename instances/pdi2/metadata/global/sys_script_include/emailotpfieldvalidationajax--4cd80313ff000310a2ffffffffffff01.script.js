var EmailOTPFieldValidationAjax = Class.create();
EmailOTPFieldValidationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    IDENTIFIER_PATTERN: /^[a-zA-Z][a-zA-Z0-9_]{0,79}$/,

    /**
     * Check if a table has any fields that reference sys_user
     * @return {String} JSON response with validation result
     */
    checkTableHasSysUserReference: function() {
        var tableName = this.getParameter('table_name');

        if (!tableName) {
            return this._createResponse(false, 'Missing table name parameter', null);
        }
        if (!this._isValidIdentifier(tableName)) {
            return this._createResponse(false, 'INVALID_IDENTIFIER', null);
        }

        var hasReference = false;
        var userFields = [];

        var gr = new GlideRecordSecure('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.addQuery('internal_type', 'reference');
        gr.query();

        while (gr.next()) {
            var reference = gr.getValue('reference');
            if (JSUtil.notNil(reference) && this._tableBelongsToSysUser(reference)) {
                hasReference = true;
                userFields.push({
                    element: gr.getValue('element'),
                    label: gr.getValue('column_label') || gr.getValue('element'),
                    reference: reference
                });
            }
        }

        return this._createResponse(hasReference,
            hasReference ? 'Table has fields that reference sys_user' : 'Table does not have any fields that reference sys_user', {
                table: tableName,
                hasReference: hasReference,
                userFields: userFields,
                fieldCount: userFields.length
            }
        );
    },

    /**
     * Validate that a user column references sys_user
     * @return {String} JSON response with validation result
     */
    validateUserColumnReference: function() {
        var tableName = this.getParameter('table_name');
        var fieldName = this.getParameter('field_name');

        if (!tableName || !fieldName) {
            return this._createResponse(false, 'Missing required parameters', null);
        }
        if (!this._isValidIdentifier(tableName) || !this._isValidIdentifier(fieldName)) {
            return this._createResponse(false, 'INVALID_IDENTIFIER', null);
        }

        // Special case for sys_id field on tables that extend sys_user
        if (fieldName == 'sys_id' && this._tableBelongsToSysUser(tableName)) {
            return this._createResponse(true, 'sys_id field is valid for sys_user tables', {
                field: fieldName,
                reference: 'sys_user',
                isInherited: true
            });
        }

        var gr = new GlideRecordSecure('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.addQuery('element', fieldName);
        gr.addQuery('internal_type', 'reference');
        gr.query();

        if (gr.next()) {
            var reference = gr.getValue('reference');
            if (JSUtil.notNil(reference) && this._tableBelongsToSysUser(reference)) {
                return this._createResponse(true, 'Field references sys_user', {
                    field: fieldName,
                    reference: reference,
                    isInherited: false
                });
            }
            return this._createResponse(false, 'Field does not reference sys_user', {
                field: fieldName,
                reference: reference
            });
        }

        return this._createResponse(false, 'Field not found in table', null);
    },

    /**
     * Validate that an email column is of internal type "email"
     * @return {String} JSON response with validation result
     */
    validateEmailColumnType: function() {
        var tableName = this.getParameter('table_name');
        var fieldName = this.getParameter('field_name');

        if (!tableName || !fieldName) {
            return this._createResponse(false, 'Missing required parameters', null);
        }
        if (!this._isValidIdentifier(tableName) || !this._isValidIdentifier(fieldName)) {
            return this._createResponse(false, 'INVALID_IDENTIFIER', null);
        }

        var gr = new GlideRecordSecure('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.addQuery('element', fieldName);
        gr.query();

        if (gr.next()) {
            var internalType = gr.getValue('internal_type');
            if (internalType === 'email') {
                return this._createResponse(true, 'Field is a valid email type', {
                    field: fieldName,
                    internalType: internalType
                });
            }
            return this._createResponse(false, 'Field is not an email type', {
                field: fieldName,
                internalType: internalType
            });
        }

        return this._createResponse(false, 'Field not found in table', null);
    },

    /**
     * Validate identifier shape — table or column name must match a strict
     * platform-identifier pattern before being used in any query.
     * @param {String} name
     * @return {Boolean}
     */
    _isValidIdentifier: function(name) {
        return name != null && this.IDENTIFIER_PATTERN.test(String(name));
    },

    /**
     * Check if a table is or extends sys_user. Resolves the full table
     * hierarchy (the table and all its ancestors) from the platform's
     * in-memory schema cache in a single call.
     * @param {String} tableName
     * @return {Boolean}
     */
    _tableBelongsToSysUser: function(tableName) {
        if (!this._isValidIdentifier(tableName)) return false;
        if (tableName == 'sys_user') return true;

        var hierarchy = new GlideTableHierarchy(tableName).getTables();
        return hierarchy != null && hierarchy.indexOf('sys_user') !== -1;
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

    type: 'EmailOTPFieldValidationAjax'
});
