function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const {
        eventName,
        eventPayload
    } = event.payload;
    var blockcontext = { ...eventPayload.blockcontext};

    eventHandler(eventName);

    function eventHandler(eventName) {
        switch (eventName) {
            case 'CR#SHOW_REQUEST_FORM':
                blockcontext.showRequestForm = true;
                blockcontext.showSummaryForm = false;
                publish();
                break;
            case 'CR#OPEN_DATA_LOSS_MODAL':
                aceUtils.openModal("a3ef-98fe-998b9b-4478-9b9b038a");
                break;
            case 'CR#CLOSE_DATA_LOSS_MODAL':
                aceUtils.dismissModal("a3ef-98fe-998b9b-4478-9b9b038a");
                break;
            case 'CR#PROCEED_TO_AUTHENTICATE':
                aceUtils.dismissModal("a3ef-98fe-998b9b-4478-9b9b038a");
                helpers.timing.setTimeout(() => {
                    eventHandler("CR#OPEN_AUTHENTICATION_MODEL");
                }, 500)
                break;
            case 'CR#OPEN_AUTHENTICATION_MODEL':
                blockcontext.authenticateButtonLabel = blockcontext.text.Authenticate;
                blockcontext.authenticatingTargetInstance = false;
                blockcontext.showTargetInstanceAuthenticationErrorMessage = false;
                blockcontext.showTargetInstanceAuthenticationInfoMessage = true;
                publish();
                aceUtils.openModal("5937-9a4b-ab9a9b-9496-b9b9dd88");
                break;
            case 'CR#RUN_PRE_FLIGHT_CHECKS':
                blockcontext.showEstimatedDurationSummaryInfo = false;
                blockcontext.showPreflightErrorMessage = false;
                blockcontext.disableSubmitButton = false;
                blockcontext.showPreflightWarningMessage = false;
                runPreflightChecks();
                break;
            case 'CR#UPDATE_SOURCE_INSTANCE_USERNAME':
                blockcontext.sourceInstanceUsername = eventPayload.fieldValue;
                publish();
                break;
            case 'CR#UPDATE_SOURCE_INSTANCE_PASSWORD':
                blockcontext.sourceInstancePassword = eventPayload.fieldValue;
                publish();
                break;
            case 'CR#UPDATE_TARGET_INSTANCE_USERNAME':
                blockcontext.targetInstanceUsername = eventPayload.fieldValue;
                publish();
                break;
            case 'CR#UPDATE_TARGET_INSTANCE_PASSWORD':
                blockcontext.targetInstancePassword = eventPayload.fieldValue;
                publish();
                break;
            case 'CR#AUTHENTICATE_TARGET_INSTANCE':
                blockcontext.authenticateButtonLabel = blockcontext.text.Authenticating;
                blockcontext.authenticatingTargetInstance = true;
                blockcontext.disableActionButton = true;
                blockcontext.disableSubmitButton = true;
                publish();
                callUtilAPI({
                    operation: "INSTANCE_AUTH",
                    instanceUrl: blockcontext.targetInstanceUrl,
                    userName: blockcontext.targetInstanceUsername,
                    password: blockcontext.targetInstancePassword,
                    registerInstance: false
                }, true);
                break;
            case 'CR#SHOW_SUMMARY':
                blockcontext.other_settings_2 = [{
                    "label": "Clone Frequency",
                    "value": {
                        "type": "string",
                        "value": blockcontext.cloneFrequencySummaryValue
                    }
                }];
                if (blockcontext.cloneRequestIdSelectedItemLabel) {
                    blockcontext.other_settings_2.push({
                        "label": "Use the same backup as another clone request",
                        "value": {
                            "type": "string",
                            "value": blockcontext.cloneRequestIdSelectedItemLabel
                        }
                    });
                }
                blockcontext.showRequestForm = false;
                blockcontext.showSummaryForm = true;
                blockcontext.lockSettingsSummaryValue = blockcontext.lockSettings == true ? blockcontext.text.Yes : blockcontext.text.No;
                blockcontext.numberOfOccurrencesSummaryValue = !blockcontext.frequencyCard.occurrences.count ? blockcontext.text.NumberZero : blockcontext.frequencyCard.occurrences.count;
                blockcontext.authenticateTargetHeader = blockcontext.authenticateTargetHeaderLabel + blockcontext.targetInstanceName;
                publish();
                break;
            case 'CR#ESTIMATED_DURATION_INFO_CLOSE':
                blockcontext.showEstimatedDurationSummaryInfo = false;
                publish();
                break;
            case 'CR#SOURCE_INSTANCE_SELECTED':
                blockcontext.previousSourceInstanceName = blockcontext.sourceInstanceName;
                blockcontext.previousSourceInstanceId = blockcontext.sourceInstanceId;
                blockcontext.previousSourceInstanceUrl = blockcontext.sourceInstanceUrl;
                blockcontext.sourceInstanceName = eventPayload.item.label;
                blockcontext.sourceInstanceId = eventPayload.value;
                blockcontext.sourceInstanceUrl = eventPayload.item.instanceUrl;
                blockcontext.authenticatingSourceInstance = false;
                publish();

                if (eventPayload.value != "currentInstance") {
                    aceUtils.openModal("92a3-b3b7-a998a8-4997-8baae698");
                } else {
                    blockcontext.cloneProfiles = blockcontext.defaultCloneProfiles;
                    blockcontext.cloneProfileName = blockcontext.defaultCloneProfileName;
                    blockcontext.cloneProfile = blockcontext.defaultCloneProfile;
                    populateCloneProfileData(blockcontext.cloneProfile);
                    filterTargetInstance();
                }
                break;
            case 'CR#CLOSE_SOURCE_INSTANCE_AUTHENTICATION_MODAL':
                blockcontext.sourceInstanceName = blockcontext.previousSourceInstanceName;
                blockcontext.sourceInstanceId = blockcontext.previousSourceInstanceId;
                blockcontext.sourceInstanceUrl = blockcontext.previousSourceInstanceUrl;
                closeSourceInstanceAuthenticationError();
                aceUtils.dismissModal("92a3-b3b7-a998a8-4997-8baae698");
                break;
            case 'CR#GET_CLONE_PROFILE_LIST':
                closeSourceInstanceAuthenticationError();
                blockcontext.authenticatingSourceInstance = true;
                callUtilAPI({
                    operation: "GET_CLONE_PROFILE_LIST",
                    instanceUrl: blockcontext.sourceInstanceUrl,
                    username: blockcontext.sourceInstanceUsername,
                    password: blockcontext.sourceInstancePassword
                }, true);
                break;
            case 'CR#TARGET_INSTANCE_SELECTED':
                blockcontext.targetInstanceId = eventPayload.value;
                if (eventPayload.item.label === "Add a target instance") {
                    aceUtils.openModal("5d86-4795-b8a899-bf71-ab8b46b9");
                } else {
                    changeTargetInstance(eventPayload.value, eventPayload.item.label, eventPayload.item.instanceUrl);
                }
                publish();
                break;
            case 'CLOSE_ADD_TARGET_INSTANCE':
                blockcontext.targetInstanceId = "undefined";
                blockcontext.showAddInstanceErrorMsg = false;
                publish();
                aceUtils.dismissModal("5d86-4795-b8a899-bf71-ab8b46b9");
                break;
            case "CLOSE_ADD_SUCCESS_MSG":
                blockcontext.showAddInstanceSuccessMsg = false;
                publish();
                break;
            case 'INSTANCE_URL_SET':
                blockcontext.addInstanceUrl = eventPayload.fieldValue;
                publish();
                enableDisableAddButton();
                break;
            case 'INSTANCE_USERNAME_SET':
                blockcontext.addInstanceUserName = eventPayload.fieldValue;
                publish();
                enableDisableAddButton();
                break;
            case 'INSTANCE_PASSWORD_SET':
                blockcontext.addInstancePassword = eventPayload.fieldValue;
                publish();
                enableDisableAddButton();
                break;
            case 'ADD_INSTANCE':
                blockcontext.enableAddInstanceButton = true;
                callUtilAPI({
                    operation: "ADD_INSTANCE",
                    instanceUrl: blockcontext.addInstanceUrl,
                    userName: blockcontext.addInstanceUserName,
                    password: blockcontext.addInstancePassword,
                    registerInstance: true
                }, true);
                break;
            case 'CR#CLONE_PROFILE_SELECTED':
                var cloneProfileId = eventPayload.value;
                blockcontext.cloneProfileName = eventPayload.item.label;
                populateCloneProfileData(cloneProfileId, eventPayload.item);
                break;
            case 'CR#LOCK_SETTINGS':
                blockcontext.lockSettings = eventPayload.value;
                publish();
                break;
            case 'CR#GET_SYS_USERS':
                if (eventPayload.value) {
                    callUtilAPI({
                        operation: "GET_SYS_USERS",
                        query: eventPayload.value
                    }, false);
                }
                break;
            case 'CR#SELECT_EMAIL_UPON_COMPLETION_USERS':
                blockcontext.selectedUsers = eventPayload.value;
                blockcontext.internalEmails = parseEmailUponCompletionValue(eventPayload.value);
                blockcontext.emailUponCompletionSummaryValue = joinInternalExternalEmails(blockcontext.internalEmails,blockcontext.externalEmails);
                // Clear user suggestion data to default
                callUtilAPI({
                    operation: "GET_SYS_USERS",
                    query: ""
                }, false);
                break;
            case 'CR#OPEN_EXCLUSION_MODAL':
                if (blockcontext.sourceInstanceId == "currentInstance") {
                    const exlusionTableName = !blockcontext.cloneProfile ? 'clone_data_exclude' : 'clone_profile_exclusions';
                    const exlusionRowName = !blockcontext.cloneProfile ? 'name' : 'exclusion';
                    openDefinitionsModal(exlusionTableName, blockcontext.text.Exclusions, exlusionRowName);
                } else {
                    // Open Multi instance Table
                    openExternalPage(blockcontext.exclusionsTableLink);
                }
                break;
            case 'CR#OPEN_PRESERVER_MODAL':
                if (blockcontext.sourceInstanceId == "currentInstance") {
                    const preserverTableName = !blockcontext.cloneProfile ? 'clone_data_preserver' : 'clone_profile_preservers';
                    const preserverRowName = !blockcontext.cloneProfile ? 'name' : 'preserver';
                    openDefinitionsModal(preserverTableName, blockcontext.text.Preservers, preserverRowName);
                } else {
                    // Open Multi instance Table
                    openExternalPage(blockcontext.preserversTableLink);
                }
                break;
            case 'CR#OPEN_CLEANUP_SCRIPT_MODAL':
                if (blockcontext.sourceInstanceId == "currentInstance") {
                    const cleanupScriptTableName = !blockcontext.cloneProfile ? 'clone_cleanup_script' : 'clone_profile_cleanup_scripts';
                    const cleanupScriptRowName = !blockcontext.cloneProfile ? 'name' : 'cleanup_script';
                    openDefinitionsModal(cleanupScriptTableName, blockcontext.text.Cleanup_Scripts, cleanupScriptRowName);
                } else {
                    // Open Multi instance Table
                    openExternalPage(blockcontext.cleanupScriptsTableLink);
                }
                break;
            case 'CR#SUMMARY_DEFINITIONS_TEXT_LINK_CLICKED':
                if (blockcontext.sourceInstanceId == "currentInstance") {
                    if (!blockcontext.cloneProfile) {
                        switch (eventPayload.item.table) {
                            case "clone_profile_exclusions":
                                eventPayload.item.table = "clone_data_exclude";
                                break;
                            case "clone_profile_preservers":
                                eventPayload.item.table = "clone_data_preserver";
                                break;
                            case "clone_profile_cleanup_scripts":
                                eventPayload.item.table = "clone_cleanup_script";
                                break;
                        }
                        eventPayload.item.rowName = "name";
                    }
                    openDefinitionsModal(eventPayload.item.table, eventPayload.item.tableLable, eventPayload.item.rowName);
                } else {
                    // Open Multi Instance Table
                    switch (eventPayload.item.table) {
                        case "clone_profile_exclusions":
                            openExternalPage(blockcontext.exclusionsTableLink);
                            break;
                        case "clone_profile_preservers":
                            openExternalPage(blockcontext.preserversTableLink);
                            break;
                        case "clone_profile_cleanup_scripts":
                            openExternalPage(blockcontext.cleanupScriptsTableLink);
                            break;
                    }
                }
                break;
            case 'AMOUNT_OF_DATA_COPIED_CARD':
                blockcontext.amount_of_data_copied_from_large_tables = eventPayload.value;
                blockcontext.amountOfDataCopiedFromLargeTablesSummaryLabel = eventPayload.item.label;
                if (blockcontext.amount_of_data_copied_from_large_tables == "last_90_days") {
                    blockcontext.highlightText = "Selecting 'Last 90 days' can increase clone time.";
                    blockcontext.highlightTextShow = true;
                } else
                    blockcontext.highlightTextShow = false;
                publish();
                break;
            case 'SELECT_YOUR_BACKUP':
                resetControls();
                blockcontext.backupTypeFromCloneRequestSelectedItemId = eventPayload.item.id;
                blockcontext.backupTypeFromCloneRequestSelectedItemLabel = eventPayload.item.label;
                blockcontext.on_demand_backup = false;
                if (eventPayload.item.id == 'use_another_clone_backup') {
                    blockcontext.cloneRequestSelectionContainerShow = true;
                    blockcontext.disableContinuebutton = true;
                    blockcontext.cloneRequestIdSelectedItemId = 'clickToSelectCloneRequest';
                } else {
                    if (eventPayload.item.id == 'on_demand_backup') {
                        blockcontext.on_demand_backup = true;
                    }
                    blockcontext.cloneRequestSelectionContainerShow = false;
                    blockcontext.disableContinuebutton = false;
                    blockcontext.cloneRequestIdSelectedItemLabel = '';
                }
                validateCloneRequest();
                publish();
                break;
            case 'CLONE_REQUEST_ID_SELECTED':
                blockcontext.cloneRequestIdSelectedItemId = eventPayload.value;
                blockcontext.cloneRequestIdSelectedItemLabel = eventPayload.item.label;
                if (eventPayload.value != 'clickToSelectCloneRequest') {
                    blockcontext.disableContinuebutton = false;
                } else {
                    blockcontext.disableContinuebutton = true;
                }
                publish();
                break;
            case 'APPLY_ON_DEMAND_BACKUP':
                blockcontext.on_demand_backup = eventPayload.value;
                blockcontext.onDemandBackupSummaryValue = eventPayload.value == true ? blockcontext.text.Yes : blockcontext.text.No;
                publish();
                break;
            case 'EXCLUDE_TABLES_CARD':
                blockcontext.exclude_all_from_exclusion_list = eventPayload.value;
                blockcontext.excludeTablesSpecifiedInExclusionListSummaryValue = eventPayload.value == true ? blockcontext.text.Yes : blockcontext.text.No;
                publish();
                break;
            case 'EXCLUDE_AUDIT_CARD':
                blockcontext.exclude_large_data = eventPayload.value;
                blockcontext.excludeAuditAndLogDataSummaryValue = eventPayload.value == true ? blockcontext.text.Yes : blockcontext.text.No;
                publish();
                break;
            case 'EXCLUDE_ATTACHMENTS_CARD':
                blockcontext.filter_attachment_data = eventPayload.value;
                blockcontext.excludeAttachmentDataSummaryValue = eventPayload.value == true ? blockcontext.text.Yes : blockcontext.text.No;
                publish();
                break;
            case 'PRESERVE_THEME_CARD':
                blockcontext.preserve_theme = eventPayload.value;
                blockcontext.preserverThemeSummaryValue = eventPayload.value == true ? blockcontext.text.Yes : blockcontext.text.No;
                publish();
                break;
            case 'NUMBER_OF_DAYS_CARD':
                blockcontext.preserve_in_progress_update_sets = eventPayload.value;
                blockcontext.preserveInProgressGlobalUpdateSetsSummaryValue = eventPayload.item.label;
                publish();
                break;
            case 'CR#RESET_TO_DEFAULT':
                blockcontext.selectedUsers = [];
                blockcontext.sourceInstanceName = blockcontext.text.Current_instance;
                blockcontext.sourceInstanceId = "currentInstance";
                blockcontext.targetInstanceName = "";
                blockcontext.targetInstanceId = "";
                blockcontext.targetInstanceUrl = "";
                blockcontext.cloneProfiles = blockcontext.defaultCloneProfiles;
                blockcontext.targetInstances = blockcontext.defaultTargetInstances;
                blockcontext.cloneProfile = blockcontext.defaultCloneProfile || "";
                blockcontext.cloneProfileName = blockcontext.defaultCloneProfileName || blockcontext.text.None;
                blockcontext.lockSettings = false;
                blockcontext.estimatedStartDateTime = "";
                blockcontext.estimatedDuration = "";
                blockcontext.disableContinuebutton = true;
                blockcontext.disableCloneScheduleStartTime = true;
                blockcontext.showEstimatedDuration = false;
                blockcontext.frequencyCard.cloneFrequency.selected = "0";
                blockcontext.cloneFrequencySummaryValue = blockcontext.text.None;
                blockcontext.frequencyCard.weeklyBiweekly.show = false;
                blockcontext.frequencyCard.occurrences.show = false;
                blockcontext.frequencyCard.estimatedEdnDateShow = false;
                blockcontext.frequencyCard.occurrences.count = "";
                blockcontext.showConflictCalendarMessage = false;
                blockcontext.amountOfDataCopiedFromLargeTablesSummaryLabel = blockcontext.amount_of_data_copied_from_large_tables == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.Full;
                blockcontext.backupTypeFromCloneRequestSelectedItemLabel = blockcontext.defaultBackupTypeFromCloneRequestLabel;
                blockcontext.cloneRequestIdSelectedItemLabel = blockcontext.text.Click_to_select_clone_request;
                blockcontext.cloneRequestIdSelectedItemId = "clickToSelectCloneRequest";
                blockcontext.internalEmails = '';
                blockcontext.externalEmails = '';
                populateCloneProfileData(blockcontext.cloneProfile);
                break;
            case 'CR#ADD_CLONE_REQUEST':
                var cloneRequestData = {
                    source_instance: blockcontext.sourceInstanceId == "currentInstance" ? null : blockcontext.sourceInstanceId,
                    target_instance: blockcontext.targetInstanceId,
                    clone_profile: blockcontext.sourceInstanceId == "currentInstance" ? blockcontext.cloneProfile : "",
                    clone_profile_name: blockcontext.cloneProfileName == blockcontext.text.None ? "" : blockcontext.cloneProfileName,
                    lock_profile_settings: blockcontext.lockSettings,
                    estimated_start_date_time: blockcontext.estimatedStartDateTime,
                    estimated_duration: blockcontext.estimatedDurationMs,
                    email_upon_completion: parseEmailUponCompletionId(blockcontext.selectedUsers,blockcontext.externalEmails),
                    amount_of_data_copied_from_large_tables: blockcontext.amount_of_data_copied_from_large_tables,
                    exclude_all_from_exclusion_list: blockcontext.exclude_all_from_exclusion_list,
                    exclude_large_data: blockcontext.exclude_large_data,
                    filter_attachment_data: blockcontext.filter_attachment_data,
                    on_demand_backup: blockcontext.backupTypeFromCloneRequestSelectedItemId == 'use_recent_backup' ? false : true,
                    preserve_in_progress_update_sets: blockcontext.preserve_in_progress_update_sets == "none" ? null : blockcontext.preserve_in_progress_update_sets,
                    preserve_theme: blockcontext.preserve_theme,
                    cloud_details: blockcontext.cloudDetails,
                    frequency: blockcontext.frequencyCard.cloneFrequency.selected == 0 ? null : blockcontext.frequencyCard.cloneFrequency.selected,
                    occurrences: blockcontext.frequencyCard.occurrences.count,
                    selectedDayOfWeek: blockcontext.frequencyCard.weeklyBiweekly.day,
                    username: blockcontext.targetInstanceUsername,
                    password: blockcontext.targetInstancePassword,
                    cloneReqSysId: blockcontext.cloneReqSysId,
                    securityToken: blockcontext.securityToken,
                    backup_type: blockcontext.backupTypeFromCloneRequestSelectedItemId,
                    clone_request_id_for_backup: blockcontext.cloneRequestIdSelectedItemId
                };
                callUtilAPI({
                    operation: "CREATE_CLONE_REQUEST",
                    cloneRequestData: cloneRequestData
                }, true);
                break;
            case 'CR#CLOSE_CLONE_REQUEST_FORM_ERROR':
                closeCloneRequestFormError();
                break;
            case 'CR#CANCEL_CLICKED':
                redirect({
                    route: 'home',
                });
                break;
            case 'CLONE_REQUEST_SUCCESS_MODAL_CLICKED':
                navigateToPage({
                    route: 'clone-status',
                    fields: {
                        'sysId': blockcontext.createdCloneRequestId,
                        't': Date.now()
                    }
                });
                break;
            case 'CR#CALENDAR_CLICKED':
                var curr = new Date(blockcontext.today);
                blockcontext.showConflictCalendarMessage = false;
                publish();
                aceUtils.openModal("a026-2701-898b8a-e5b3-8ab8e189");
                break;
            case 'CR#CC_RANGE_UPDATED':
                var utcTime = new Date(eventPayload.startMoment._d.getTime() + eventPayload.startMoment._d.getTimezoneOffset() * 60000);
                getCalendarConflictEntries(utcTime);
                break;
            case 'CR#CLONE_SCHEDULED_START_TIME_INVALID_SET':
                //If clone scheduled start time is empty
                if (eventPayload.value) {
                    blockcontext.disableContinuebutton = true;
                    publish();
                }
                break;
            case 'CR#CLONE_SCHEDULED_START_TIME_CHANGED':
                callUtilAPI({
                    operation: "CHECK_SLOT_AVAILABILITY",
                    sourceInstanceId: blockcontext.sourceInstanceId == "currentInstance" ? "" : blockcontext.sourceInstanceId,
                    targetInstanceId: blockcontext.targetInstanceId,
                    requestedTime: eventPayload.value
                }, true);
                break;
            case 'CR#CC_SCHEDULE':
                aceUtils.dismissModal("a026-2701-898b8a-e5b3-8ab8e189");
                var selectedTime = eventPayload.event.start;
                callUtilAPI({
                    operation: "CHECK_SLOT_AVAILABILITY",
                    sourceInstanceId: blockcontext.sourceInstanceId == "currentInstance" ? "" : blockcontext.sourceInstanceId,
                    targetInstanceId: blockcontext.targetInstanceId,
                    requestedTime: selectedTime
                }, false);
                break;

            case 'CR#EXTERNAL_EMAIL_ADDRESS_SET':
                var regexEmailValidator = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                blockcontext.showInvalidEmailMessage = false;
                var _externalEmails = eventPayload.value.trim();
                blockcontext.externalEmails = eventPayload.value.trim();
                var _regex = /;/gi;
                _externalEmails.replaceAll(_regex,',');
                var _invalidEmails = [];
                if(_externalEmails) {
                    _externalEmails = _externalEmails.split(',');
                    for(var i in _externalEmails) {
                        var _email = _externalEmails[i].trim();
                        if(_email) {
                            if (!regexEmailValidator.test(_email)) {
                                blockcontext.disableContinuebutton = true;
                                _invalidEmails.push(_email);
                            }
                        }
                    }
                }
                if(_invalidEmails.length > 0) {
                    blockcontext.showExernalEmailInfo = false;
                    if(_invalidEmails.length == 1) {
                        helpers.translate('{0} is not a valid email address',_invalidEmails[0]).then((translatedText)=>{
                            blockcontext.showInvalidEmailMessage = true;
                            blockcontext.invalidEmailMessage = translatedText;
                        });
                    }
                    else {
                        helpers.translate('{0} are not valid email addresses',_invalidEmails.join(',')).then((translatedText)=>{
                            blockcontext.showInvalidEmailMessage = true;
                            blockcontext.invalidEmailMessage = translatedText;
                        });
                    }
                }
                else {
                    blockcontext.showExernalEmailInfo = true;
                    blockcontext.emailUponCompletionSummaryValue = joinInternalExternalEmails(blockcontext.internalEmails,blockcontext.externalEmails);
                    validateCloneRequest();
                }
                publish();
                break;
            case 'CR#EXTERNAL_EMAIL_ADDRESS_INPUT':
                if(!blockcontext.disableContinuebutton) {
                    blockcontext.disableContinuebutton = true;
                    if(blockcontext.showInvalidEmailMessage == 'false' || !blockcontext.showInvalidEmailMessage) {
                        helpers.translate('Multiple emails can be entered seperated by \',\'').then((translatedText) => {
                            blockcontext.showExernalEmailInfoMsg = translatedText;
                            blockcontext.showExernalEmailInfo = true;
                            publish();
                        });
                    }
                    publish();
                }
                break;   
            default:
                break;
        };
    }

    function enableDisableAddButton() {
        if (blockcontext.addInstanceUrl && blockcontext.addInstanceUserName && blockcontext.addInstancePassword) {
            blockcontext.enableAddInstanceButton = false;
        } else
            blockcontext.enableAddInstanceButton = true;

        publish();
    }

    function getCalendarConflictEntries(curr) {
        var first = curr.getDate() - curr.getDay();
        var last = first + 6;
        var startDate = new Date(curr.setDate(first));
        var endDate = new Date(curr.setDate(last));
        var yourDate = startDate;
        var offset = yourDate.getTimezoneOffset();
        yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000));
        startDate = yourDate.toISOString().split('T')[0] + ' 00:00:00';
        yourDate = endDate;
        offset = yourDate.getTimezoneOffset();
        yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000));
        endDate = yourDate.toISOString().split('T')[0] + ' 23:59:59';
        callUtilAPI({
            operation: "CONFLICT_CALENDAR_ENTRIES",
            startDate: startDate,
            endDate: endDate,
            targetInstanceId: blockcontext.targetInstanceId
        }, false);
    };

    function resetControls() {
        blockcontext.cloneRequestSelectionContainerShow = false;
    }

    function callUtilAPI(body, loaderNeeded) {
        if (loaderNeeded) loaderComponent(true);
        return helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                ...body
            }
        }).then(response => {
            callbackHandler(body, response.response);
        }).catch(response => {
            try {
                errorCallbackHandler(body, response.error);
                console.log(body.operation + " failed: " + JSON.stringify(response.error));
            } catch (e) {
                console.log(body.operation + " failed: " + JSON.stringify(response));
            }
        });
    };

    function callbackHandler(body, response) {
        switch (body.operation) {
            case 'ADD_INSTANCE':
                if (response.result.isError) {
                    blockcontext.showAddInstanceErrorMsg = true;
                    blockcontext.addInstanceErrorMsg = "Unable to save the instance " + blockcontext.addInstanceUrl + ". Authentication failed: " + response.result.message;
                    publish();
                } else {
                    blockcontext.showAddInstanceErrorMsg = false;
                    blockcontext.showAddInstanceSuccessMsg = true;
                    blockcontext.addInstanceSuccessMsg = "Instance " + blockcontext.addInstanceUrl + "  " + " is saved successfully";
                    publish();
                    callUtilAPI({
                        operation: "GET_TARGET_INSTANCES"
                    });
                }
                break;
            case "GET_TARGET_INSTANCES":
                if (response.result.isError) {
                    /* not yet coded */
                } else {
                    blockcontext.targetInstances = response.result.items;
                    let targetInstanceAdded = blockcontext.targetInstances.find(({
                        instanceUrl
                    }) => {
                        var _instanceUrl = blockcontext.addInstanceUrl;
                        if (!_instanceUrl.startsWith("https://") && !_instanceUrl.startsWith("http://"))
                            _instanceUrl = "https://" + _instanceUrl;
                        return instanceUrl === _instanceUrl;
                    });
                    //blockcontext.targetInstanceId = blockcontext.targetInstances.find(({instanceUrl})=>{return instanceUrl === blockcontext.addInstanceUrl}).id;
                    aceUtils.dismissModal("5d86-4795-b8a899-bf71-ab8b46b9");
                    helpers.timing.setTimeout(() => {
                        changeTargetInstance(targetInstanceAdded.id, targetInstanceAdded.label, targetInstanceAdded.instanceUrl);
                    }, 500);
                }
                break;
            case 'GET_CLONE_PROFILE_LIST':
                blockcontext.authenticatingSourceInstance = false;
                if (response.result.isError) {
                    showSourceInstanceAuthenticationError(response.result.errorMessage || response.result.message);
                    break;
                }
                aceUtils.dismissModal("92a3-b3b7-a998a8-4997-8baae698");
                let cloneProfiles = [{
                    label: blockcontext.text.None,
                    id: ""
                }];
                // Default clone profile to None
                blockcontext.cloneProfile = "";
                blockcontext.cloneProfileName = blockcontext.text.None;
                blockcontext.defaultRemoteProfileData = {};
                response.result.profiles.forEach((profile) => {
                    cloneProfiles.push({
                        ...profile,
                        id: profile.sysId,
                        label: profile.name
                    });
                    if (profile.default_profile == 'true') {
                        blockcontext.cloneProfile = profile.sysId;
                        blockcontext.cloneProfileName = profile.name;
                        blockcontext.defaultRemoteProfileData = profile;
                    }
                });
                blockcontext.cloneProfiles = cloneProfiles;
                filterTargetInstance();
                populateCloneProfileData(blockcontext.cloneProfile, blockcontext.defaultRemoteProfileData);
                break;
            case 'GET_DEFINITIONS_REMOTE_INSTANCE_DATA':
                if (response.result.isError) {
                    showCloneRequestFormError(response.result.errorMessage || response.result.message);
                    break;
                }

                closeCloneRequestFormError(); // Close previous error message

                blockcontext.cloudDetails = response.result;

                blockcontext.exclusionsCount = response.result.exclusion.count;
                blockcontext.preserversCount = response.result.preserver.count;
                blockcontext.cleanupScriptsCount = response.result.cleanupScript.count;

                blockcontext.exclusionsTableLink = response.result.exclusion.link;
                blockcontext.preserversTableLink = response.result.preserver.link;
                blockcontext.cleanupScriptsTableLink = response.result.cleanupScript.link;

                publish();
                break;
            case 'GET_CLONE_PROFILE':
                blockcontext = {
                    ...blockcontext,
                    ...response.result
                };
                blockcontext.cloneProfile = response.result.sys_id;
                blockcontext.amountOfDataCopiedFromLargeTablesSummaryLabel = blockcontext.amount_of_data_copied_from_large_tables == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.Full;
                blockcontext.onDemandBackupSummaryValue = blockcontext.backupTypeFromCloneProfileDefaultSelectedItem == "on_demand_backup" ? blockcontext.text.Yes : blockcontext.text.No
                blockcontext.backupTypeFromCloneRequestSelectedItemId = blockcontext.backupTypeFromCloneProfileDefaultSelectedItem;
                blockcontext.excludeTablesSpecifiedInExclusionListSummaryValue = blockcontext.exclude_all_from_exclusion_list == "true" ? blockcontext.text.Yes : blockcontext.text.No;
                blockcontext.excludeAuditAndLogDataSummaryValue = blockcontext.exclude_large_data == "true" ? blockcontext.text.Yes : blockcontext.text.No;
                blockcontext.excludeAttachmentDataSummaryValue = blockcontext.filter_attachment_data == "true" ? blockcontext.text.Yes : blockcontext.text.No;
                blockcontext.preserverThemeSummaryValue = blockcontext.preserve_theme == "true" ? blockcontext.text.Yes : blockcontext.text.No;
                blockcontext.preserveInProgressGlobalUpdateSetsSummaryValue = blockcontext.preserve_in_progress_update_sets == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.None;
                if (!!response.result.target_instance) {
                    var targetInstanceId = response.result.target_instance;
                    var targetInstanceDetails = getTargetInstanceDetails(targetInstanceId);
                    changeTargetInstance(targetInstanceId, targetInstanceDetails.name, targetInstanceDetails.url);
                } else {
                    publish();
                }
                break;
            case 'GET_SYS_USERS':
                blockcontext.users = response.result || [];
                publish();
                break;
            case 'GET_NEXT_AVAILABLE_SLOT':
                if (response.result.isError) {
                    openErrorModal(response.result.message);
                    break;
                }

                blockcontext.showEstimatedDuration = true;
                blockcontext.estimatedStartDateTime = response.result.estimatedStartDateTime;
                blockcontext.estimatedDuration = response.result.estimatedDuration;
                blockcontext.estimatedDurationMs = response.result.estimatedDurationMs;
                blockcontext.estimatedDurationInfoMessage = response.result.message;
                blockcontext.onDemandBackupEstimationMessage = response.result.onDemandBackupEstimationMsg;
                blockcontext.successModalInfoMessage = blockcontext.successModalInfoMessageLabel + blockcontext.estimatedDuration;
                blockcontext.estimatedDurationMessage = blockcontext.estimatedDurationLabel + ": " + response.result.estimatedDuration;
                blockcontext.estimatedCloneEndTime = response.result.estimatedCloneEndTime;
                blockcontext.frequencyCard.maxRecurringCloneDuration = response.result.maxRecurringCloneDuration;
                blockcontext.validationRules = response.result.validation_rules;
                blockcontext.largeTablesList = response.result.largeTablesList;
                //conflict calendar entry
                blockcontext.nextAvailableTimeSlot = {
                    "start": blockcontext.estimatedDurationInternal,
                    "end": blockcontext.estimatedDurationInternal,
                    "type": "available"
                };
                blockcontext.disableCloneScheduleStartTime = false;
                validateCloneRequest();
                publish();
                break;
            case 'GET_DEFINITIONS_TABLE_DATA':
                let rows = [];
                let result = response.result;
                for (let i = 0; i < result.length; i++) {
                    var key = result[i][0];
                    var row_value = result[i][1];
                    rows.push({
                        key: key,
                        cells: {
                            row_name: {
                                value: row_value
                            }
                        }
                    });
                }
                const rowDefinitions = {
                    rows: rows
                };
                blockcontext.rowDefinitions = rowDefinitions;
                blockcontext.table_name = blockcontext.model_table_name;
                publish();
                aceUtils.openModal("1f07-66d9-899a8b-dd6e-a9ba40ab");
                break;
            case 'INSTANCE_AUTH':
                blockcontext.authenticateButtonLabel = blockcontext.text.Authenticate;
                blockcontext.authenticatingTargetInstance = false;
                if (response.result.isError) {
                    blockcontext.targetInstanceAuthenticationErrorMessage = response.result.message;
                    blockcontext.showTargetInstanceAuthenticationErrorMessage = true;
                    blockcontext.showTargetInstanceAuthenticationInfoMessage = false;
                    blockcontext.disableActionButton = false;
                    blockcontext.disableSubmitButton = false;
                    publish();
                } else {
                    aceUtils.dismissModal("5937-9a4b-ab9a9b-9496-b9b9dd88");
                    blockcontext.cloneReqSysId = response.result.cloneReqSysId;
                    blockcontext.securityToken = response.result.securityToken;
                    eventHandler('CR#ADD_CLONE_REQUEST');
                }
                break;
            case 'RUN_PREFLIGHT_CHECK':
                if (response.result.isError && response.result.errorType == 'error') {
                    blockcontext.showEstimatedDurationSummaryInfo = false;
                    blockcontext.showPreflightErrorMessage = true;
                    blockcontext.disableSubmitButton = true;
                    blockcontext.preflightErrorMessage = response.result.message;
                } else if (response.result.isError && response.result.errorType == 'warning') {
                    blockcontext.showEstimatedDurationSummaryInfo = true;
                    blockcontext.showPreflightWarningMessage = true;
                    blockcontext.preflightWarningMessage = response.result.message;
                } else {
                    blockcontext.showEstimatedDurationSummaryInfo = true;
                }
                eventHandler('CR#SHOW_SUMMARY');
                break;
            case 'CREATE_CLONE_REQUEST':
                blockcontext.disableActionButton = false;
                blockcontext.disableSubmitButton = false;
                if (!!response.result && !!response.result.cloneRequestId) {
                    blockcontext.successMessage = '';
                    blockcontext.createdCloneRequestId = response.result.cloneRequestId;
                    publish();
                    aceUtils.openModal("922a-63bf-98a8b8-3d76-9988edb8");
                } else {
                    openErrorModal(response.result.error);
                }
                break;
            case 'CONFLICT_CALENDAR_ENTRIES':
                blockcontext.calendarEntries = response.result;
                publish();
                break;
            case 'CHECK_SLOT_AVAILABILITY':
                if (response.result.isError) {
                    blockcontext.showConflictCalendarMessage = true;
                    blockcontext.conflictCalendarMessage = response.result.message;
                } else {
                    blockcontext.estimatedStartDateTime = response.result.estimatedStartDateTime;
                    blockcontext.showConflictCalendarMessage = false;
                    blockcontext.estimatedDuration = response.result.estimatedDuration;
                    blockcontext.estimatedDurationMs = response.result.estimatedDurationMs;
                    blockcontext.estimatedDurationInfoMessage = response.result.message;
                    blockcontext.onDemandBackupEstimationMessage = response.result.onDemandBackupEstimationMsg;
                    blockcontext.successModalInfoMessage = blockcontext.successModalInfoMessageLabel + blockcontext.estimatedDuration;
                    blockcontext.estimatedDurationMessage = blockcontext.estimatedDurationLabel + ": " + response.result.estimatedDuration;
                    blockcontext.estimatedCloneEndTime = response.result.estimatedCloneEndTime;
                    blockcontext.frequencyCard.maxRecurringCloneDuration = response.result.maxRecurringCloneDuration;
                    blockcontext.validationRules = response.result.validation_rules;
                    blockcontext.largeTablesList = response.result.largeTablesList;
                    blockcontext.estimatedStartDateTime = response.result.estimatedStartDateTime;
                }
                validateCloneRequest();
                publish();
                break;
        }
        loaderComponent(false);
    }

    function errorCallbackHandler(body, response) {
        if (body.operation == "CREATE_CLONE_REQUEST" || body.operation == "INSTANCE_AUTH") {
            blockcontext.disableActionButton = false;
            blockcontext.disableSubmitButton = false;
        }

        loaderComponent(false);
        var errorMessage = response.data.result ?.error || response.data ?.error ?.message;
        openErrorModal(errorMessage);
    }

    function openErrorModal(errorMessage) {
        blockcontext.errorMessage = errorMessage || blockcontext.text.GenericErrorMessage;
        publish();
        aceUtils.openModal("a613-0765-b989a8-e3b0-9aa91a8a");
    }

    function showCloneRequestFormError(errorMessage) {
        blockcontext.showCloneRequestFormError = true;
        blockcontext.cloneRequestFormError = errorMessage || blockcontext.text.GenericErrorMessage;
        publish();
    }

    function showSourceInstanceAuthenticationError(errorMessage) {
        blockcontext.showSourceInstanceAuthenticationErrorMessage = true;
        blockcontext.sourceInstanceAuthenticationErrorMessage = errorMessage || blockcontext.text.GenericErrorMessage;
        publish();
    }

    function closeSourceInstanceAuthenticationError() {
        blockcontext.showSourceInstanceAuthenticationErrorMessage = false;
        blockcontext.sourceInstanceAuthenticationErrorMessage = "";
        publish();
    }

    function closeCloneRequestFormError() {
        blockcontext.showCloneRequestFormError = false;
        blockcontext.cloneRequestFormError = "";
        publish();
    }

    function openDefinitionsModal(table, tableLabel, rowName) {
        blockcontext.model_table_name = table;
        blockcontext.row_name = rowName;
        blockcontext.table_lable = tableLabel;
        var row_display = rowName.charAt(0).toUpperCase() + rowName.slice(1);
        const columnDefinitions = {
            columns: [{
                key: "row_name",
                type: "string",
                label: row_display.replace("_", " ")
            }, ],
        };
        blockcontext.columnDefinitions = columnDefinitions;
        callUtilAPI({
            operation: "GET_DEFINITIONS_TABLE_DATA",
            row_name: rowName,
            table_name: table,
            profile_sys_id: blockcontext.cloneProfile
        });
    }

    function getTargetInstanceDetails(targetInstanceId) {
        var selectedTargetInstance = blockcontext.targetInstances.find((targetInstance) => targetInstance.id == targetInstanceId);
        return {
            "name": selectedTargetInstance.label,
            "url": selectedTargetInstance.instanceUrl
        };
    }

    function changeTargetInstance(selectedTargetInstanceId, selectedTargetInstanceName, selectedTargetInstanceUrl) {
        blockcontext.targetInstanceName = selectedTargetInstanceName;
        blockcontext.targetInstanceId = selectedTargetInstanceId;
        blockcontext.targetInstanceUrl = selectedTargetInstanceUrl;
        publish();

        getNextAvailableSlot(blockcontext.sourceInstanceId, selectedTargetInstanceId);
    }

    function getNextAvailableSlot(sourceInstanceId, targetInstanceId) {
        if (!!targetInstanceId) {
            callUtilAPI({
                operation: 'GET_NEXT_AVAILABLE_SLOT',
                sourceInstanceId: sourceInstanceId == "currentInstance" ? "" : sourceInstanceId,
                targetInstanceId: targetInstanceId
            }, true);
        }
    }

    function runPreflightChecks() {
        if (blockcontext.sourceInstanceId != "currentInstance") {
            blockcontext.showEstimatedDurationSummaryInfo = true;
            eventHandler('CR#SHOW_SUMMARY');
        } else {
            callUtilAPI({
                operation: 'RUN_PREFLIGHT_CHECK',
                cloneProfileSysId: blockcontext.cloneProfile,
                validationRules: blockcontext.validationRules,
                largeTablesList: blockcontext.largeTablesList
            }, true);
        }
    }

    function filterTargetInstance() {
        blockcontext.targetInstances = blockcontext.defaultTargetInstances.filter((targetInstance) => targetInstance.id != blockcontext.sourceInstanceId);
        if (blockcontext.targetInstanceId == blockcontext.sourceInstanceId) {
            blockcontext.targetInstanceName = blockcontext.text.None;
            blockcontext.targetInstanceId = "";
            blockcontext.targetInstanceUrl = "";
            blockcontext.estimatedStartDateTime = "";
            blockcontext.estimatedDuration = "";
            blockcontext.disableContinuebutton = true;
            blockcontext.showEstimatedDuration = false;
            blockcontext.disableCloneScheduleStartTime = true;
        } else {
            getNextAvailableSlot(blockcontext.sourceInstanceId, blockcontext.targetInstanceId);
        }
        publish();
    }

    function populateCloneProfileData(profileId, cloneProfileData = {}) {
        if (!profileId) {
            blockcontext.lockSettings = false;
            blockcontext.showLockSettings = false;
        } else {
            blockcontext.showLockSettings = true;
            blockcontext.lockSettings = false;
        }

        //Handling clone profile selection on multi instance scenario
        if (blockcontext.sourceInstanceId != "currentInstance") {
            //blockcontext.cloneProfile = cloneProfileData.name || "";
            blockcontext.amount_of_data_copied_from_large_tables = cloneProfileData.amount_of_data_copied_from_large_tables || "full";
            blockcontext.exclude_all_from_exclusion_list = cloneProfileData.exclude_all_from_exclusion_list || "true";
            blockcontext.exclude_large_data = cloneProfileData.exclude_large_data || "true";
            blockcontext.filter_attachment_data = cloneProfileData.filter_attachment_data || "true";
            blockcontext.on_demand_backup = cloneProfileData.on_demand_backup || cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem == "on_demand_backup" ? "true" : "false";
            blockcontext.backupTypeFromCloneRequestSelectedItemId = blockcontext.backupTypeFromCloneProfileDefaultSelectedItem || 'use_recent_backup';
            blockcontext.preserve_in_progress_update_sets = !cloneProfileData.preserve_in_progress_update_sets ? "none" : cloneProfileData.preserve_in_progress_update_sets;
            blockcontext.preserve_theme = cloneProfileData.preserve_theme || "true";

            blockcontext.amountOfDataCopiedFromLargeTablesSummaryLabel = blockcontext.amount_of_data_copied_from_large_tables == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.Full;
            blockcontext.onDemandBackupSummaryValue = blockcontext.on_demand_backup == "true" ? blockcontext.text.Yes : blockcontext.text.No
            blockcontext.excludeTablesSpecifiedInExclusionListSummaryValue = blockcontext.exclude_all_from_exclusion_list == "true" ? blockcontext.text.Yes : blockcontext.text.No;
            blockcontext.excludeAuditAndLogDataSummaryValue = blockcontext.exclude_large_data == "true" ? blockcontext.text.Yes : blockcontext.text.No;
            blockcontext.excludeAttachmentDataSummaryValue = blockcontext.filter_attachment_data == "true" ? blockcontext.text.Yes : blockcontext.text.No;
            blockcontext.preserverThemeSummaryValue = blockcontext.preserve_theme == "true" ? blockcontext.text.Yes : blockcontext.text.No;
            blockcontext.preserveInProgressGlobalUpdateSetsSummaryValue = blockcontext.preserve_in_progress_update_sets == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.None;

            callUtilAPI({
                operation: "GET_DEFINITIONS_REMOTE_INSTANCE_DATA",
                instanceUrl: blockcontext.sourceInstanceUrl,
                username: blockcontext.sourceInstanceUsername,
                password: blockcontext.sourceInstancePassword,
                profileName: cloneProfileData.name
            }, true);
        } else {
            callUtilAPI({
                operation: "GET_CLONE_PROFILE",
                sysId: profileId
            }, true);
        }
    };

    function validateCloneRequest() {
        blockcontext.disableContinuebutton = false;

        if (!blockcontext.targetInstanceId) {
            blockcontext.disableContinuebutton = true;
        }

        if (!blockcontext.estimatedStartDateTime || blockcontext.showConflictCalendarMessage) {
            blockcontext.disableContinuebutton = true;
        }

        if (blockcontext.frequencyCard.cloneFrequency.selected != '0') {
            if (!blockcontext.frequencyCard.occurrences.count || blockcontext.frequencyCard.occurrences.count <= 0 || blockcontext.frequencyCard.occurrences.count > blockcontext.frequencyCard.occurrences.maxCount) {
                blockcontext.disableContinuebutton = true;
            }
        }

        if (blockcontext.frequencyCard.weeklyBiweekly.day == 0) {
            blockcontext.disableContinuebutton = true;
        }

        if(blockcontext.externalEmails.length > 0) {
            var regexEmailValidator = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            var  _invalidEmails = [];
            var _externalEmails = blockcontext.externalEmails;
            var _regex = /;/gi;
            _externalEmails.replaceAll(_regex,',');
            _externalEmails = _externalEmails.split(',');
            for(var i in _externalEmails) {
                var _email = _externalEmails[i].trim();
                if(_email){
                    if (!regexEmailValidator.test(_email)) {
                        blockcontext.disableContinuebutton = true;
                        _invalidEmails.push(_email);
                    }
                }
            }
            if(_invalidEmails.length > 0)
                blockcontext.disableContinuebutton = true;
        }
    }

    function parseEmailUponCompletionValue(emailUponCompletionValue) {
        var emailUponCompletionSummaryValue = "";
        for (var index = 0; index < emailUponCompletionValue.length; index++) {
            emailUponCompletionSummaryValue += emailUponCompletionValue[index].label;
            if (index !== (emailUponCompletionValue.length - 1)) {
                emailUponCompletionSummaryValue += ", ";
            }
        }
        return !!emailUponCompletionSummaryValue ? emailUponCompletionSummaryValue : '';//blockcontext.text.None;
    }

    function parseEmailUponCompletionId(emailUponCompletionValue,externalEmails) {
        var emailUponCompletionId = "";
        for (var index = 0; index < emailUponCompletionValue.length; index++) {
            emailUponCompletionId += emailUponCompletionValue[index].id;
            if (index !== (emailUponCompletionValue.length - 1)) {
                emailUponCompletionId += ",";
            }
        }
        if(externalEmails) {
            var _externalEmails = removeWhiteSpaces(externalEmails.split(','));
            emailUponCompletionId += emailUponCompletionId ? ','+_externalEmails.join(',') : _externalEmails.join(',');
        }

        return emailUponCompletionId ? removeDuplicates(emailUponCompletionId.split(',')).join(',') : '';
    }

    function joinInternalExternalEmails(internalEmails,externalEmails) {
        var emails = ''
        if(internalEmails) {
            emails = internalEmails;
        }
        if(externalEmails) {
            var _externalEmails = removeWhiteSpaces(externalEmails.split(','));
            emails += emails ? ','+_externalEmails.join(',') : _externalEmails.join(',');
        }
        return emails ? removeDuplicates(emails.split(',')).join(', ') : blockcontext.text.None;
    }

    function removeDuplicates(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }

    function removeWhiteSpaces(arr) {
        arr.forEach((item, index) => {
            arr[index] = item.trim()
        });
        return arr.filter((e) => e);
    }

    function loaderComponent(show) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: show,
            label: loadingText,
            action: null,
            nonBlocking: false
        });
    }

    function redirect(navPayload) {
        api.emit("NAV_ITEM_SELECTED", {
            ...navPayload,
            reload: true
        });
    }

    function navigateToPage(navPayload) {
        api.emit("NAV_ITEM_SELECTED", {
            ...navPayload,
            reload: false
        });
    }

    function openExternalPage(url) {
        api.emit('NAV_ITEM_SELECTED', {
            "external": {
                "url": url
            }
        });
    }

    function publish() {
        aceUtils.setContext(blockcontext);
    }
}
