function include({ imports }) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { RULE_TYPE, MESSAGE_TYPE, STATE } = imports["global.DMClientConstants"]();

    const UI_MESSAGE = {
        SCOPE_MISMATCH_FOR_CREATE: 'The rule will be created in the same application scope as the table ({1}). The current application scope ({2}) remains unchanged.',
        SCOPE_MISMATCH_FOR_EDIT: 'The rule will be edited in the same application scope as the table ({1}). The current application scope ({2}) remains unchanged.',
        INVALID_DURATION_NON_POSITIVE: 'Value Must be a Positive Number',
        DM_POLICY_INACTIVE_MESSAGE_HEADER: 'Attention: The data management policy for this table is presently inactive.',
        DM_POLICY_INACTIVE_MESSAGE_LINK_LABEL: 'Activate Policy',
        DM_POLICY_INACTIVE_MESSAGE: 'To activate the rule, ensure that the data management policy for the table is set to active.',
        AGE_LESS_THAN_24_HOURS: 'Table cleaner entry was set to clean records less than 24 hrs (86400 seconds) old. Settings of less than 24 hrs can result in missing session statistics data.',
        MANDATORY_FIELDS_MESSAGE: 'Ensure that all mandatory fields are provided',
        ARCHIVE_ESTIMATE_IN_PROGRESS: 'Estimation of records selected by the condition is in progress. Record estimate field will be updated once the process is complete.',
        ARCHIVE_ESTIMATE_COMPLETED: 'Record estimate field updated with value based on the latest estimate. Restored records are not included in the estimate.',
        ARCHIVE_DESTORY_ESTIMATE_IN_PROGRESS: 'Estimation of destroy records selected by the condition is in progress. Record estimate field will be updated once the process is complete.',
        ARCHIVE_DESTROY_ESTIMATE_COMPLETED: 'Destroy record estimate field updated with value based on the latest estimate.',
        AGE_DURATION_EXCEEDED: 'The overall duration must be in the range of 0 to 68 years',
        RULE_UPDATE_SUCCESS: 'Rule has been updated successfully',
        RULE_INVALID_UPDATE: 'Invalid Update',
        INVALID_DATE_FIELD: 'Duration field must be an integer and Days should be in range(0 to 24854), Hours should be in range(0 to 23), Minutes should be in range(0 to 59), Seconds should be in range(0 to 59)',
        INVALID_TARGET_TIME: "Please specify valid date and time for execution.",
        SCHEDULE_TIME_PASSED: "Scheduled time has passed.",
        EMPTY_SCHEDULE_TIME: "Please specify valid date and time for execution.",
        EXECUTE_LATER_WARNING: "Scheduling to execute later may affect a different number of records.",
        ARCHIVE_ACTIVE_RULE_NO_CONDITION: "A condition must be specified for a rule to be active"
    };

    // Business Rule messages that require transformations in DMC
    const BR_MESSAGE = {
        AGE_DURATION_EXCEEDED: 'The age must be in range from 0 to 2147483647',
        //capturing "Archive - Log next scheduled run" BR messages
        ARCHIVE_JOB_RUNNING: 'Archive currently running. Will have to wait until the next execution',
        NEXT_ARCHIVE_RUN_IN: 'The next archive will occur in',
        NO_ARCHIVE_SCHEDULED_JOB_FOUND: 'No scheduled archive job could be found'
    };
    // Transformations for Business Rule Messages
    const BR_TRANSFORM_MESSAGE = {
        AGE_DURATION_EXCEEDED: UI_MESSAGE.AGE_DURATION_EXCEEDED
    };

    const formatString = (template, params) => {
        return template.replace(/\{(\d+)\}/g, (match, index) =>
            typeof params[index - 1] !== 'undefined' ? params[index - 1] : match
        );
    };

    const getFormattedMessage = async(api, helpers, message, ...params) => {
        return await helpers.translate(formatString(message, params));
    };

    const pushMessage = (api, helpers, messageObj) => {
        var alertMessages = deepClone(api.state[STATE.MESSAGES]);
        var isMessageAlreadyExist = false;
        alertMessages.forEach(alertMessage => {
            if(alertMessage.message == messageObj.message) {
                isMessageAlreadyExist = true;
            }
        });
        if(!isMessageAlreadyExist) {
            alertMessages.push(messageObj);
        }
        api.setState(STATE.MESSAGES, alertMessages);
    };
    const removeMessage = (api, helpers, messageObj) => {
        const alertMessages = deepClone(api.state[STATE.MESSAGES]);
        for(let i = alertMessages.length - 1; i >= 0; i--) {
            if(alertMessages[i].message === messageObj.message) {
                alertMessages.splice(i, 1);
            }
        }
        api.setState(STATE.MESSAGES, alertMessages);
    };
    const removeMessageWithIndex = (api, helpers, index) => {
        const alertMessages = deepClone(api.state[STATE.MESSAGES]);
        if(index >= 0 && index < alertMessages.length) {
            alertMessages.splice(index, 1);
        }
        api.setState(STATE.MESSAGES, alertMessages);
    };
    const clearMessages = (api, helpers) => {
        api.setState(STATE.MESSAGES, []);
    };
    return {
        UI_MESSAGE,
        BR_MESSAGE,
        BR_TRANSFORM_MESSAGE,
        getFormattedMessage,
        pushMessage,
        removeMessage,
        clearMessages,
        removeMessageWithIndex
    }
}
