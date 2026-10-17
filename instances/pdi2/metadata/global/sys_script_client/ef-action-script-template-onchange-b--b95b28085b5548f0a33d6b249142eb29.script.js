// Individual Action Template (is_bulk = false)
function getIndividualTemplate() {
    return '/**\n' +
        ' * Individual Action Script\n' +
        ' *\n' +
        ' * Parameters:\n' +
        ' * @param {string} error_sys_id - The sys_id of the error record (sys_error table)\n' +
        ' *                              Use global.ErrorManager.getErrorsBySysIDs(error_sys_id) to get the error GlideRecord\n' +
        ' *                              Access fields: error.getValue(\'error_code\'), error.getValue(\'message\'), etc.\n' +
        ' *                              Get context: JSON.parse(error.getValue(\'context\') || \'{}\')\n' +
        ' *\n' +
        ' * @param {string} execution_sys_id - The sys_id of the execution item\n' +
        ' * @param {object} params - Optional key-value parameters passed via ErrorManager.executeAction()\n' +
        ' *\n' +
        ' * Logger usage — pass true as the second argument to also write to the execution log table:\n' +
        ' * const logger = global.ErrorManager.getActionExecutionLogger(execution_sys_id);\n' +
        ' * logger.info(\'Message\', true);\n' +
        ' * logger.warn(\'Warning\', true);\n' +
        ' * logger.error(\'Error\', true);\n' +
        ' * logger.debug(\'Debug info\');    // omit true to log to system log only\n' +
        ' *\n' +
        ' * IMPORTANT: This function must return an object with the structure:\n' +
        ' * {\n' +
        ' *   success: boolean,     // Required - Indicates whether the action completed successfully\n' +
        ' *   message?: string,     // Optional - Error Code preferred, or human-readable message\n' +
        ' *   data?: object,        // Optional - Additional data from action execution\n' +
        ' *   errors_to_close?: [string] // Optional - Sys_id of error to close after successful execution\n' +
        ' * }\n' +
        ' */\n' +
        '(function(error_sys_id, execution_sys_id) {\n' +
        '    try {\n' +
        '        const logger = global.ErrorManager.getActionExecutionLogger(execution_sys_id);\n' +
        '        const errorGr = global.ErrorManager.getErrorsBySysIDs(error_sys_id);\n' +
        '        if (!errorGr.next())\n' +
        '            throw new Error(gs.getMessage(\'Error record not found.\'));\n' +
        '        \n' +
        '        // params - optional key-value args from ErrorManager.executeAction() e.g. params.myKey\n' +
        '        // Your individual processing logic here\n' +
        '        logger.info(\'Processing individual action\', true);\n' +
        '        \n' +
        '        return {\n' +
        '            success: true,\n' +
        '            message: \'Individual action executed successfully\'\n' +
        '        };\n' +
        '    } catch (e) {\n' +
        '        return {\n' +
        '            success: false,\n' +
        '            message: e.message || \'Unknown error occurred\'\n' +
        '        };\n' +
        '    }\n' +
        '})(error_sys_id, execution_sys_id);';
}

// Bulk Action Template (is_bulk = true)
function getBulkTemplate() {
    return '/**\n' +
        ' * Bulk Action Script\n' +
        ' *\n' +
        ' * Parameters:\n' +
        ' * @param {string[]} error_sys_ids - Array of error sys_ids to process in bulk (sys_error table)\n' +
        ' *                                 Use global.ErrorManager.getErrorsBySysIDs(error_sys_ids) to get GlideRecord\n' +
        ' *                                 Iterate: while (errors.next()) { ... }\n' +
        ' *                                 Access fields: errors.getValue(\'error_code\'), errors.getValue(\'message\'), etc.\n' +
        ' *                                 Get context: JSON.parse(errors.getValue(\'context\') || \'{}\')\n' +
        ' *\n' +
        ' * @param {string} execution_sys_id - The sys_id of the execution item\n' +
        ' * @param {object} params - Optional key-value parameters passed via ErrorManager.executeAction()\n' +
        ' *\n' +
        ' * Logger usage — pass true as the second argument to also write to the execution log table:\n' +
        ' * const logger = global.ErrorManager.getActionExecutionLogger(execution_sys_id);\n' +
        ' * logger.info(\'Message\', true);\n' +
        ' * logger.warn(\'Warning\', true);\n' +
        ' * logger.error(\'Error\', true);\n' +
        ' * logger.debug(\'Debug info\');    // omit true to log to system log only\n' +
        ' *\n' +
        ' * IMPORTANT: This function must return an object with the structure:\n' +
        ' * {\n' +
        ' *   success: boolean,     // Required - Indicates whether the action completed successfully\n' +
        ' *   message?: string,     // Optional - Error Code preferred, or human-readable message\n' +
        ' *   data?: object,        // Optional - Additional data from action execution\n' +
        ' *   errors_to_close?: [string] // Optional - Array of error sys_ids to close after successful execution\n' +
        ' * }\n' +
        ' */\n' +
        '(function(error_sys_ids, execution_sys_id) {\n' +
        '    try {\n' +
        '        const logger = global.ErrorManager.getActionExecutionLogger(execution_sys_id);\n' +
        '        const errorGrs = global.ErrorManager.getErrorsBySysIDs(error_sys_ids);\n' +
        '        if (!errorGrs.hasNext())\n' +
        '            throw new Error(gs.getMessage(\'No error records found.\'));\n' +
        '        \n' +
        '        // params - optional key-value args from ErrorManager.executeAction() e.g. params.myKey\n' +
        '        // Your bulk processing logic here\n' +
        '        logger.info(\'Processing bulk action for \' + error_sys_ids.length + \' errors\', true);\n' +
        '        \n' +
        '        let processedCount = 0;\n' +
        '        while (errorGrs.next()) {\n' +
        '            processedCount++;\n' +
        '            // Process each error in the bulk\n' +
        '        }\n' +
        '        \n' +
        '        return {\n' +
        '            success: true,\n' +
        '            message: \'Bulk action completed for \' + processedCount + \' errors\',\n' +
        '            data: { processedCount: processedCount }\n' +
        '        };\n' +
        '    } catch (e) {\n' +
        '        return {\n' +
        '            success: false,\n' +
        '            message: e.message || \'Unknown error occurred\'\n' +
        '        };\n' +
        '    }\n' +
        '})(error_sys_ids, execution_sys_id);';
}

// Update script field based on is_bulk value
function updateScriptTemplate() {
    var isBulk = g_form.getValue('is_bulk');
    var currentScript = g_form.getValue('script');

    if (g_form.isNewRecord()) {
        var newTemplate = (isBulk == 'true') ? getBulkTemplate() : getIndividualTemplate();
        g_form.setValue('script', newTemplate);
    }
}

// Function called when form loads
function onLoad() {
        updateScriptTemplate();
}

// Function called when is_bulk field changes
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }
    updateScriptTemplate();
}
