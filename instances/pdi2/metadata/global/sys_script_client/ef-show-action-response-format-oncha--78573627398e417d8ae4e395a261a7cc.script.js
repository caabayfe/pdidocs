// This function works for both onLoad and onChange events
function handleActionTypeChange(isChange) {
    g_form.clearMessages();

    var actionType = g_form.getValue('type');
    var isBulk = g_form.getValue('is_bulk');

    if (actionType === 'open_url') {
        if (isChange) g_form.setValue('input', '');
        var openUrlMsg = 'Provide a <b>NAV_ITEM_SELECTED</b> payload as JSON. Use one of these two shapes:<br><br>' +
            '<b>External URL</b> (opens in a new tab):<br>' +
            '{ "external": { "url": "https://example.com", "target": "_blank" }, "navigationOptions": { "navigateExternal": true } }<br><br>' +
            '<b>Internal route</b> (navigates within ServiceNow):<br>' +
            '{ "route": "record", "fields": { "table": "incident", "sysId": "-1" } }';
        g_form.addInfoMessage(openUrlMsg);
        return;
    }

    if (actionType === 'table') {
        if (isChange) g_form.setValue('input', '');
        g_form.addInfoMessage(
            'Provide navigation target as JSON. ' +
            'Use a plain table name to open a new-record form, or suffix with <b>_list</b> to open the list view:<br>' +
            '<b>{ "table": "incident" }</b> &amp;nbsp; or &amp;nbsp; <b>{ "table": "incident_list" }</b>'
        );
        return;
    }

    if (actionType === 'message') {
        return;
    }

    var supportedActionTypes = ['script', 'flow_action', 'subflow', 'scripted_rest_resource'];

    if (!supportedActionTypes.includes(actionType))
        return;

    var message = "";

    // Common response format for all action types
    var responseFormat = '<strong>Response format:</strong><br>' +
        '{<br>' +
        '&amp;nbsp;&amp;nbsp;success: boolean,          // Required - true/false; see note below about defaults<br>' +
        '&amp;nbsp;&amp;nbsp;message: string,           // Optional - Error Code preferred, or human-readable message<br>' +
        '&amp;nbsp;&amp;nbsp;data: object,              // Optional - Additional data from action execution<br>' +
        '&amp;nbsp;&amp;nbsp;errorsToClose: [string]    // Optional - Array of error sys_ids to close after successful execution<br>' +
        '}';

    // API usage code snippet varies based on bulk vs individual
    var apiUsageSnippet;
    if (isBulk == 'true') {
        apiUsageSnippet = '// Bulk Action API Usage:<br>' +
            'const logger = global.ErrorManager.getActionExecutionLogger(execution_sys_id);<br>' +
            'const errorGrs = global.ErrorManager.getErrorsBySysIDs(error_sys_ids);<br><br>' +
            '// Process all errors in bulk:<br>' +
            'while (errorGrs.next()) {<br>' +
            '&amp;nbsp;&amp;nbsp;const errorCode = errorGrs.getValue(\'error_code\');<br>' +
            '&amp;nbsp;&amp;nbsp;const errorMessage = errorGrs.getValue(\'message\');<br>' +
            '&amp;nbsp;&amp;nbsp;const errorState = errorGrs.getValue(\'state\');<br>' +
            '&amp;nbsp;&amp;nbsp;const sourceApplication = errorGrs.getValue(\'source_application\');<br>' +
            '&amp;nbsp;&amp;nbsp;const context = JSON.parse(errorGrs.getValue(\'context\') || \'{}\');<br>' +
            '&amp;nbsp;&amp;nbsp;// Process each error in the batch<br>' +
            '}<br><br>' +
            '// Logger usage — pass true as the second argument to also write to the execution log table:<br>' +
            'logger.info(\'Processing bulk action for \' + error_sys_ids.length + \' errors\', true);<br>' +
            'logger.warn(\'Warning message\', true);<br>' +
            'logger.error(\'Error occurred\', true);<br>' +
            'logger.debug(\'Debug info\');  // omit true to log to system log only';
    } else {
       apiUsageSnippet = '// Access error and logging using the Error Framework API:<br>' +
            'const logger = global.ErrorManager.getActionExecutionLogger(execution_sys_id);<br>' +
            'const errorGr = global.ErrorManager.getErrorsBySysIDs(error_sys_id);<br><br>' +
            'if (!errorGr.next()) throw new Error(gs.getMessage(\'Error record not found.\'));<br><br>' +
            '// Access error fields:<br>' +
            'const errorCode = errorGr.getValue(\'error_code\');<br>' +
            'const errorMessage = errorGr.getValue(\'message\');<br>' +
            'const errorState = errorGr.getValue(\'state\');<br>' +
            'const sourceApplication = errorGr.getValue(\'source_application\');<br><br>' +
            '// Get context data:<br>' +
            'const context = JSON.parse(errorGr.getValue(\'context\') || \'{}\');<br><br>' +
            '// Logger usage — pass true as the second argument to also write to the execution log table:<br>' +
            'logger.info(\'Processing started\', true);<br>' +
            'logger.warn(\'Warning message\', true);<br>' +
            'logger.error(\'Error occurred\', true);<br>' +
            'logger.debug(\'Debug info\');  // omit true to log to system log only';
    }

    // Configuration for action type specific terminology and output guidance
    var actionConfig = {
        'script': {
            displayName: 'script actions',
            parameterType: 'parameters',
            actionVerb: 'return',
            outputNote: 'Return this object as the final expression of the script. If <b>success</b> is omitted or the script does not return an object, the action is treated as <b>failed</b>.'
        },
        'subflow': {
            displayName: 'subflows',
            parameterType: 'input parameters',
            actionVerb: 'output',
            outputNote: 'Define these as Flow Designer <b>output variables</b>. If <b>success</b> is not returned, it defaults to <b>false</b> — you must explicitly output <b>true</b>.'
        },
        'flow_action': {
            displayName: 'flow actions',
            parameterType: 'input parameters',
            actionVerb: 'output',
            outputNote: 'Define these as Flow Designer <b>output variables</b>. If <b>success</b> is not returned, it defaults to <b>false</b> — you must explicitly output <b>true</b>.'
        },
        'scripted_rest_resource': {
            displayName: 'REST endpoints (POST/PUT/PATCH only)',
            parameterType: 'in the request body',
            actionVerb: 'return',
            outputNote: 'Return this as the JSON response body. If <b>success</b> is omitted, it is inferred from the HTTP status code (2xx = success).'
        }
    };

    // Build message using template with variable interpolation
    var config = actionConfig[actionType];
    if (config) {
        var scope = isBulk == 'true' ? 'Bulk' : 'Individual';
        var errorParam = isBulk == 'true' ? 'error_sys_ids (array)' : 'error_sys_id';

        message = scope + ' ' + config.displayName + ' receive ' + errorParam +
                 ' and execution_sys_id ' + config.parameterType + ' and must ' +
                 config.actionVerb + ' a standardized response in this format:';
    }

    var essentialMessage = message + '<br>' + responseFormat;
    if (config && config.outputNote) {
        essentialMessage += '<br>' + config.outputNote;
    }
    if (actionType === 'subflow' || actionType === 'flow_action') {
        var errorSysIdParam = isBulk == 'true'
            ? '&amp;nbsp;&amp;nbsp;error_sys_ids: Array.String,    // Required - array of error sys_ids to process'
            : '&amp;nbsp;&amp;nbsp;error_sys_id: String,          // Required - sys_id of the error being processed';
        essentialMessage += '<br><strong>Required input variables</strong> (must be defined with these exact names or the action errors before execution):<br>' +
            '{<br>' +
            errorSysIdParam + '<br>' +
            '&amp;nbsp;&amp;nbsp;execution_sys_id: String,       // Required - sys_id of the action execution record<br>' +
            '&amp;nbsp;&amp;nbsp;params: Object                  // Required - caller-supplied key-value pairs; pass {} if none<br>' +
            '}';
    }
    if (actionType === 'scripted_rest_resource') {
        if (isBulk == 'true') {
            essentialMessage += '<br><strong>Method:</strong> POST/PUT/PATCH<br><strong>Body:</strong> {"error_sys_ids": [...], "execution_sys_id": "..."}';
        } else {
            essentialMessage += '<br><strong>Method:</strong> POST/PUT/PATCH<br><strong>Body:</strong> {"error_sys_id": "...", "execution_sys_id": "..."}';
        }
    }
    // Optional params schema section (shown last — it's for discovery only)
    var inputGuidance = {
        'script': 'Params are available as a top-level <b>params</b> variable in your script (e.g. <b>params.myKey</b>).',
        'flow_action': 'Params are passed as the <b>params</b> input to your flow action.',
        'subflow': 'Params are passed as the <b>params</b> input to your subflow.',
        'scripted_rest_resource': 'Params are included in the request body as the <b>params</b> object.'
    };
    var inputExample = '{<br>' +
        '&amp;nbsp;&amp;nbsp;"params": [<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;{<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;"name": "severity",<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;"type": "string",<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;"label": "Severity",<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;"required": false,<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;"description": "Override severity level"<br>' +
        '&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;}<br>' +
        '&amp;nbsp;&amp;nbsp;]<br>' +
        '}';
    essentialMessage += '<br><strong>Input field (params schema):</strong> (Optional) Define the params schema that callers discover via <b>ErrorManager.getActions()</b>. ' +
        inputGuidance[actionType] +
        '<br>Example:<br>' + inputExample;

    // Add collapsible API examples section
    var apiSectionId = 'ef_api_examples_' + actionType;
    essentialMessage += '<br>' +
        '<a href="#" onclick="' +
            'var section = document.getElementById(\'' + apiSectionId + '\'); ' +
            'var link = this; ' +
            'if (section.style.display === \'none\') { ' +
                'section.style.display = \'block\'; ' +
                'link.innerHTML = \'🔽 Hide API Examples\'; ' +
            '} else { ' +
                'section.style.display = \'none\'; ' +
                'link.innerHTML = \'▶️ Show API Examples\'; ' +
            '} return false;">' +
        '▶️ Show API Examples</a>';

    essentialMessage += '<div id="' + apiSectionId + '" style="display:none; position:fixed; top:15%; left:10%; right:10%; z-index:9999; max-height:70%; overflow-y:auto; padding:20px; background:#ffffff; border:2px solid #0073e6; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.3);">' +
        '<div style="text-align:right; margin-bottom:10px;"><a href="#" onclick="document.getElementById(\'' + apiSectionId + '\').style.display=\'none\'; return false;" style="color:#999; text-decoration:none; font-size:18px;">✖</a></div>' +
        '<strong>Error Framework API Usage:</strong><br><br>' + apiUsageSnippet + '</div>';

    g_form.addInfoMessage(essentialMessage);
}

// Function called when form loads
function onLoad() {
    handleActionTypeChange(false);
}

// Function called when type field changes
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }
    handleActionTypeChange(true);
}
