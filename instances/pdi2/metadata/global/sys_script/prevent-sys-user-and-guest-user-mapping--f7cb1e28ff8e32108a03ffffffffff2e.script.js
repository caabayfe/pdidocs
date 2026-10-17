(function executeRule(current, previous /*null when async*/ ) {
    var answerGr = new GlideRecord('knowledge_based_answer');
    answerGr.addQuery('sys_id', current.answer);
    answerGr.query();

    var userColumn = '';
    var answerTable = '';
    var isScriptEnabled = false;
    if (answerGr.next()) {
        userColumn = answerGr.user_column;
        answerTable = answerGr.answer_table;
        isScriptEnabled = JSUtil.notNil(answerGr.script_configuration);
    }

    if (isScriptEnabled)
        return;

    var mappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
    mappingGr.addQuery('question', current.question);
    if (current.operation() == 'update') {
        mappingGr.addQuery('sys_id', '!=', current.sys_id);
    }
    mappingGr.query();

    var answerIds = [];
    while (mappingGr.next()) {
        answerIds.push(mappingGr.answer);
    }

    var mappedAnswerGr = new GlideRecord('knowledge_based_answer');
    mappedAnswerGr.addQuery('sys_id', 'IN', answerIds.join(','));
    mappedAnswerGr.query();

    while (mappedAnswerGr.next()) {
        var mappedUserColumn = mappedAnswerGr.user_column;
        var mappedAnswerTable = mappedAnswerGr.answer_table;

        if (JSUtil.nil(mappedUserColumn) && JSUtil.notNil(userColumn) && JSUtil.notNil(answerTable) && doesUserColumnHasSysUserReference(answerTable, userColumn)) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot save the record. Question is already mapped to answer without a system user column reference. Please choose a different Answer or Question.'));
        }

        if (JSUtil.notNil(mappedUserColumn) && JSUtil.notNil(userColumn) && JSUtil.notNil(answerTable) && JSUtil.notNil(mappedAnswerTable) && doesUserColumnHasSysUserReference(answerTable, userColumn) && !doesUserColumnHasSysUserReference(mappedAnswerTable, mappedUserColumn)) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot save the record. Question is already mapped to answer without a system user column reference. Please choose a different Answer or Question.'));
        }

        if (JSUtil.notNil(mappedUserColumn) && JSUtil.nil(userColumn) && JSUtil.notNil(mappedAnswerTable) && doesUserColumnHasSysUserReference(mappedAnswerTable, mappedUserColumn)) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot save the record. Question is already mapped to answer with a system user column reference. Please choose a different Answer or Question.'));
        }

        if (JSUtil.notNil(mappedUserColumn) && JSUtil.notNil(userColumn) && JSUtil.notNil(answerTable) && JSUtil.notNil(mappedAnswerTable) && doesUserColumnHasSysUserReference(mappedAnswerTable, mappedUserColumn) && !doesUserColumnHasSysUserReference(answerTable, userColumn)) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot save the record. Question is already mapped to answer with a system user column reference. Please choose a different Answer or Question.'));
        }
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
