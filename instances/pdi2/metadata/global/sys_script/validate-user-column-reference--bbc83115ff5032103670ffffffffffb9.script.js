(function executeRule(current, previous /*null when async*/) {

    // Only validate if user_column field has a value and answer_table is set
    if (!current.user_column || !current.answer_table) {
        return;
    }

    var tableName = current.answer_table.toString();
    var fieldName = current.user_column.toString();

    // Validate the field reference
    if (!validateFieldReference(tableName, fieldName)) {
        // Abort the operation and show error message
        gs.addErrorMessage(gs.getMessage('Selected field "{0}" should have a reference', fieldName));
        current.setAbortAction(true);

    }

})(current, previous);

/**
 * Validate that a field references sys_user table or a table that extends sys_user
 * @param {String} tableName - Name of the table containing the field
 * @param {String} fieldName - Name of the field to validate
 * @returns {Boolean} - True if field is valid, false otherwise
 */
function validateFieldReference(tableName, fieldName) {
    if (!tableName || !fieldName) {
        return false;
    }

    try {

        if(fieldName == 'sys_id' && checkTableInheritance(tableName)) {
            return true;
        }

        // Query sys_dictionary to get field information
        var fieldGr = new GlideRecord('sys_dictionary');
        fieldGr.addQuery('name', tableName);
        fieldGr.addQuery('element', fieldName);
        fieldGr.query();

        if (!fieldGr.next()) {
            return false;
        }

        var reference = fieldGr.getValue('reference');

        // Check if field has a reference
        if (JSUtil.notNil(reference)) {
            return true;
        }

        // Field doesn't have a reference
        return false;

    } catch (e) {
        gs.error('validateFieldReference: Error validating field - ' + e.message);
        return false;
    }
}

/**
 * Check if a table extends sys_user by traversing the inheritance hierarchy
 * @param {String} tableName - Name of the table to check
 * @returns {Boolean} - True if table extends sys_user, false otherwise
 */
function checkTableInheritance(tableName) {
    if (!tableName) {
        return false;
    }

    var visited = {};
    return checkTableInheritanceRecursive(tableName, visited);
}

/**
 * Recursively check table inheritance to prevent infinite loops
 * @param {String} tableName - Current table name to check
 * @param {Object} visited - Object to track visited tables
 * @returns {Boolean} - True if table extends sys_user, false otherwise
 */
function checkTableInheritanceRecursive(tableName, visited) {
    // Prevent infinite loops by tracking visited tables
    if (visited[tableName]) {
        gs.warn('checkTableInheritanceRecursive: Circular inheritance detected for table ' + tableName);
        return false;
    }
    visited[tableName] = true;

    // Base case: we've reached sys_user
    if (tableName === 'sys_user') {
        return true;
    }

    try {
        // Get the parent class of the current table
        var tableGr = new GlideRecord('sys_db_object');
        tableGr.addQuery('name', tableName);
        tableGr.query();

        if (tableGr.next()) {
            var superClass = tableGr.super_class;
            if (superClass) {
                // Recursively check the parent class
                return checkTableInheritanceRecursive(superClass, visited);
            }
        }

        // No parent class found or table doesn't exist
        return false;

    } catch (e) {
        gs.error('checkTableInheritanceRecursive: Error checking inheritance for table ' + tableName + ' - ' + e.message);
        return false;
    }
}
