(function executeRule(current, previous /*null when async*/ ) {
    var type = '';
    var serviceMappingGR = new GlideRecord('knowledge_based_question_service_mapping');
    serviceMappingGR.addQuery('question', current.question);
    serviceMappingGR.query();

    while (serviceMappingGR.next()) {
        type = serviceMappingGR.type;
        if (type == 'authentication')
           break;
    }

    if (JSUtil.nil(type) || type == 'identification')
        return;

    var userColumn = '';
    var answerTable = '';
    var isScriptEnabled = false;
    var answerGR = new GlideRecord('knowledge_based_answer');
    answerGR.addQuery('sys_id', current.answer);
    answerGR.query();

    if (answerGR.next()) {
        userColumn = answerGR.user_column;
        answerTable = answerGR.answer_table;
        isScriptEnabled = JSUtil.notNil(answerGR.script_configuration);
    }

    if (isScriptEnabled)
        return;

    if (JSUtil.nil(userColumn)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Answer should not have an empty user column for authentication type. Please choose a different Answer or Question.'));
    }

    if (JSUtil.notNil(userColumn) && JSUtil.notNil(answerTable) && !doesUserColumnHasSysUserReference(answerTable, userColumn)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Answer should have a system user column reference for authentication type. Please choose a different Answer or Question.'));
    }

    function doesUserColumnHasSysUserReference(tableName, userColumn) {
        var dictionaryGr = new GlideRecord('sys_dictionary');
        dictionaryGr.addQuery('name', tableName);
        dictionaryGr.addQuery('element', userColumn);
        dictionaryGr.addQuery('internal_type', 'reference');
        dictionaryGr.query();

        if (dictionaryGr.next()) {
            var reference = dictionaryGr.reference;
            if ("sys_user".equalsIgnoreCase(reference))
                return true;
        }

        if (userColumn == 'sys_id' && checkTableInheritance(tableName)) {
            return true;
        }

        return false;
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
        if (tableName == 'sys_user') {
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
})(current, previous);
