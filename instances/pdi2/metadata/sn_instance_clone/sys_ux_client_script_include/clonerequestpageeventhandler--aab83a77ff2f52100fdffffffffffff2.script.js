function include({ imports }, api, helpers) {

    function computeRelativeTimeTooltip(scheduledTime, serverCurrentTime, durationMs, targetInstanceId) {
        if (!scheduledTime) {
            api.setState("showEstimatedCompletionTime", false);
            return;
        }
        var scheduled = new Date(scheduledTime.replace(" ", "T"));

        // Validate date parsing
        if (isNaN(scheduled.getTime())) {
            api.setState("showEstimatedCompletionTime", false);
            return;
        }

        if (durationMs && targetInstanceId && targetInstanceId !== "") {
            var endDate = new Date(scheduled.getTime() + parseInt(durationMs, 10));
            var year = endDate.getFullYear();
            var month = String(endDate.getMonth() + 1).padStart(2, '0');
            var day = String(endDate.getDate()).padStart(2, '0');
            var hours = String(endDate.getHours()).padStart(2, '0');
            var minutes = String(endDate.getMinutes()).padStart(2, '0');
            var seconds = String(endDate.getSeconds()).padStart(2, '0');
            var estimatedEndTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            api.setState("estimatedCloneEndTime", estimatedEndTime);
            api.setState("estimatedCompletionMessage", "\u2713 " + api.state.estimatedCompletionLabel + ": " + estimatedEndTime);
            api.setState("showEstimatedCompletionTime", true);
        } else {
            api.setState("estimatedCloneEndTime", "");
            api.setState("estimatedCompletionMessage", "");
            api.setState("showEstimatedCompletionTime", false);
        }
    }

    function changeTargetInstance(selectedTargetInstanceId, selectedTargetInstanceName, selectedTargetInstanceUrl) {
        api.setState("targetInstanceName", selectedTargetInstanceName);
        api.setState("targetInstanceId", selectedTargetInstanceId)
        api.setState("targetInstanceUrl", selectedTargetInstanceUrl);
        api.setState("showEstimatedDuration", false);
        api.setState("estimatedCloneEndTime", "");
        api.setState("estimatedCompletionMessage", "");
        api.setState("showEstimatedCompletionTime", false);
        // Reset clone profile only when user manually changes target (not when a profile sets it)
        if (!api.state.isCloneProfileSelected) {
            api.setState("cloneProfile", "");
            api.setState("cloneProfileName", (api.state.text && api.state.text.None) ? api.state.text.None : "None");
            api.setState("showLockSettings", false);
            api.setState("lockSettings", false);
        }
        api.setState("isCloneProfileSelected", false);
        getNextAvailableSlot(api.state.sourceInstanceId, selectedTargetInstanceId);
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
            label: "Loading...",
            action: null,
            nonBlocking: false
        });
    }

    function joinInternalExternalEmails(internalEmails, externalEmails) {
        var emails = ''
        if (internalEmails) {
            emails = internalEmails;
        }
        if (externalEmails) {
            var _externalEmails = removeWhiteSpaces(externalEmails.split(','));
            emails += emails ? ',' + _externalEmails.join(',') : _externalEmails.join(',');
        }
        return emails ? removeDuplicates(emails.split(',')).join(', ') : api.state.text.None;
    }

    function parseEmailUponCompletionValue(emailUponCompletionValue) {
        var emailUponCompletionSummaryValue = "";
        for (var index = 0; index < emailUponCompletionValue.length; index++) {
            emailUponCompletionSummaryValue += emailUponCompletionValue[index].label;
            if (index !== (emailUponCompletionValue.length - 1)) {
                emailUponCompletionSummaryValue += ", ";
            }
        }
        return !!emailUponCompletionSummaryValue ? emailUponCompletionSummaryValue : '';
    }

    function populateCloneProfileData(profileId, cloneProfileData = {}, source, isByOAuth) {
        api.setState("lockSettings", false);
        if (!profileId) {
            api.setState("showLockSettings", false);
        } else {
            api.setState("showLockSettings", true);
        }
        if (!source) {
            source = api.state.sourceInstanceId;
        }
        //Handling clone profile selection on multi instance scenario
        if (source != "currentInstance") {
            var amount_of_data_copied_from_large_tables = cloneProfileData.amount_of_data_copied_from_large_tables || "full";
            var exclude_all_from_exclusion_list = cloneProfileData.exclude_all_from_exclusion_list || "true";
            var exclude_large_data = cloneProfileData.exclude_large_data || "true"
            var filter_attachment_data = cloneProfileData.filter_attachment_data || "true";
            var on_demand_backup = cloneProfileData.on_demand_backup || "false";
            var preserve_in_progress_update_sets = !cloneProfileData.preserve_in_progress_update_sets ? "none" : cloneProfileData.preserve_in_progress_update_sets;
            var preserve_theme = cloneProfileData.preserve_theme || "true";

            var _amountOfDataCopied90Days = (amount_of_data_copied_from_large_tables == "last_90_days");
            api.setState('highlightText', "Selecting 'Last 90 days' can increase clone time.");
            api.setState('highlightTextShow', _amountOfDataCopied90Days ? true : false);

            var _backupTypeFromCloneRequestSelectedItemLabel = api.state.backupTypeFromCloneRequest.find((el) => {
                return el.id == cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem;
            });
            if (!_backupTypeFromCloneRequestSelectedItemLabel)
                _backupTypeFromCloneRequestSelectedItemLabel = { label: api.state.backupTypeFromCloneRequest[0].label };

            api.setState("defaultBackupTypeFromCloneRequest", cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem); //TODO
            api.setState("defaultBackupTypeFromCloneRequestLabel", _backupTypeFromCloneRequestSelectedItemLabel.label);
            api.setState("backupTypeFromCloneRequestSelectedItemLabel", _backupTypeFromCloneRequestSelectedItemLabel.label);

            api.setState("cloneProfile", profileId || "");
            api.setState("amount_of_data_copied_from_large_tables", amount_of_data_copied_from_large_tables);
            api.setState("exclude_all_from_exclusion_list", exclude_all_from_exclusion_list);
            api.setState("exclude_large_data", exclude_large_data);
            api.setState("filter_attachment_data", filter_attachment_data);
            api.setState("on_demand_backup", on_demand_backup);
            api.setState("preserve_in_progress_update_sets", preserve_in_progress_update_sets);
            api.setState("preserve_theme", preserve_theme);

            api.setState("amountOfDataCopiedFromLargeTablesSummaryLabel", amount_of_data_copied_from_large_tables == "last_90_days" ? api.state.text.Last_90_days : api.state.text.Full);
            api.setState("onDemandBackupSummaryValue", on_demand_backup == "true" ? api.state.text.Yes : api.state.text.No)
            api.setState("excludeTablesSpecifiedInExclusionListSummaryValue", exclude_all_from_exclusion_list == "true" ? api.state.text.Yes : api.state.text.No);
            api.setState("excludeAuditAndLogDataSummaryValue", exclude_large_data == "true" ? api.state.text.Yes : api.state.text.No);
            api.setState("excludeAttachmentDataSummaryValue", filter_attachment_data == "true" ? api.state.text.Yes : api.state.text.No);
            api.setState("preserverThemeSummaryValue", preserve_theme == "true" ? api.state.text.Yes : api.state.text.No);
            api.setState('preserveInProgressGlobalUpdateSetsSummaryValue', preserve_in_progress_update_sets == "last_90_days" ? api.state.text.Last_90_days : api.state.text.None);

            if (isByOAuth) {
                callUtilAPI({
                    operation: "GET_DEFINITIONS_REMOTE_INSTANCE_DATA_BY_OAUTH",
                    instanceUrl: api.state.sourceInstanceUrl,
                    profileName: cloneProfileData.name
                }, true);
            }
            else {
                callUtilAPI({
                    operation: "GET_DEFINITIONS_REMOTE_INSTANCE_DATA",
                    instanceUrl: api.state.sourceInstanceUrl,
                    username: api.state.sourceInstanceUsername,
                    password: api.state.sourceInstancePassword,
                    profileName: cloneProfileData.name
                }, true);
            }
        } else {
            callUtilAPI({
                operation: "GET_CLONE_PROFILE",
                sysId: profileId
            }, false);
        }
    }

    function filterTargetInstance(source, target) {
        if (!source) {
            source = api.state.sourceInstanceId;
        }
        if (!target) {
            target = api.state.targetInstanceId;
        }
        var _targetInstances = api.state.defaultTargetInstances.filter((targetInstance) => targetInstance.id != source);
        api.setState("targetInstances", _targetInstances);
        if (target == source) {
            api.setState("targetInstanceName", api.state.text.None);
            api.setState("targetInstanceId", "");
            api.setState("targetInstanceUrl", "");
            api.setState("estimatedStartDateTime", "");
            api.setState("estimatedDuration", "");
            api.setState("disableContinuebutton", true);
            api.setState("showEstimatedDuration", false);
            api.setState("estimatedCloneEndTime", "");
            api.setState("estimatedCompletionMessage", "");
            api.setState("showEstimatedCompletionTime", false);
            api.setState("disableCloneScheduleStartTime", true);
        } else {
            getNextAvailableSlot(source, target);
        }
    }

    function clearRegisterInstanceModalValues() {
        api.setState('newTargetUrl','');
        api.setState('hideClientIDContainer', true);
        api.setState('disableNewTargetButton', true);
        api.setState('targetClientID','');
        api.setState('disableCompleteSetupBtn', true);
        api.setState('hideOauthErrorSetup', true);
        api.setState('oauthAddInstance', false);
        api.setState('programmaticCloseRegisterModal',false);
        var modalParams = {
            "headerMessage": api.state.registerInstanceModalParams.headerMessage
        };
        api.setState("registerInstanceModalParams", modalParams);
    }

    function openDefinitionsModal(table, tableLabel, rowName) {
        api.setState('model_table_name', table);
        api.setState("row_name", rowName);
        api.setState("table_lable", tableLabel);
        var row_display = rowName.charAt(0).toUpperCase() + rowName.slice(1);
        const columnDefinitions = {
            columns: [{
                key: "row_name",
                type: "string",
                label: row_display.replace("_", " ")
            },],
        };
        console.log("deyais: columnDefs{} " + JSON.stringify(columnDefinitions));
        api.setState("columnDefinitions", columnDefinitions);
        callUtilAPI({
            operation: "GET_DEFINITIONS_TABLE_DATA",
            row_name: rowName,
            table_name: table,
            profile_sys_id: api.state.cloneProfile
        });
    }

    function openExternalPage(url) {
        api.emit('NAV_ITEM_SELECTED', {
            "external": {
                "url": url
            }
        });
    }

    function _cacheRegisterInstanceModalParams() {
        var _modalParams = {
            "newTargetUrl": api.state.newTargetUrl,
            "hideClientIDContainer": api.state.hideClientIDContainer,
            "disableNewTargetButton": api.state.disableNewTargetButton,
            "targetClientID": api.state.targetClientID,
            "disableCompleteSetupBtn": api.state.disableCompleteSetupBtn,
            "hideOauthErrorSetup": api.state.hideOauthErrorSetup,
            "oauthAddInstance": api.state.oauthAddInstance,
            "headerMessage": api.state.registerInstanceModalParams.headerMessage,
            "authInProgress": true
        };
        api.setState("registerInstanceModalParams", _modalParams);
    }

    function authProcessHasEnded() {
        let modalParams = api.state.registerInstanceModalParams;
        modalParams.authInProgress = false;
        api.setState('registerInstanceModalParams',JSON.parse(JSON.stringify(modalParams)));
    }

    function errorCallbackHandler(body, response) {
        if (body.operation == "CREATE_CLONE_REQUEST" || body.operation == "INSTANCE_AUTH") {
            api.setState("disableActionButton", false);
            api.setState("disableSubmitButton", false);
        }

        loaderComponent(false);
        var errorMessage = response.data.result?.error || response.data?.error?.message;
        openErrorModal(errorMessage);
    }

    function openErrorModal(errorMessage, errorHeading) {
        api.setState("errorModalHeading", errorHeading || "Clone Request Error");
        api.setState("errorMessage", errorMessage || api.state.text.GenericErrorMessage);
        helpers.modal.open("error_modal");
    }

    function callbackHandler(body, response) {
        switch (body.operation) {
            case 'CREATE_OAUTH_APP_PROVIDER':
                if (response.result.error) {
                    openErrorModal(response.result.message, 'Failed to Set up OAuth to ' + body.targetInstanceUrl);
                    helpers.modal.close('register_instance');
                }
                else {
                    api.setState("addInstanceUrl", body.targetInstanceUrl);
                    var iframeUrl = api.state.iFrameUrl;
                    var _iframeUrl = iframeUrl.replace(/&?oauthProf=[^&]*/g, '');
                    _iframeUrl += '&oauthProf=' + response.result.oauth_entity_profile;
                    api.setState('iFrameUrl', _iframeUrl);
                    api.setState('programmaticCloseRegisterModal',true);
                    helpers.timing.setTimeout(() => {
                        _cacheRegisterInstanceModalParams();
                        helpers.modal.open('iframe_1');
                    }, 500);
                }
                break;
            case 'CHECK_SOURCE_OAUTH_SETUP':
                if (!response.result.ready) {
                    callUtilAPI({
                        operation: "CHECK_SOURCE_OAUTH_ELIGIBLE",
                        instanceUrl: body.instanceUrl,
                        addInstance: false
                    }, true)
                }
                else {
                    var iframeUrl = api.state.iFrameUrl;
                    iframeUrl = iframeUrl.replace(/&?oauthProf=[^&]*/g, '');
                    api.setState('newTargetUrl', body.instanceUrl);
                    console.log('Response: ' + JSON.stringify(response.result));
                    iframeUrl += '&oauthProf=' + response.result.oauth_entity_profile;
                    api.setState('iFrameUrl', iframeUrl);
                    api.setState('programmaticCloseRegisterModal',true);
                    helpers.timing.setTimeout(() => {
                        _cacheRegisterInstanceModalParams();
                        helpers.modal.open('iframe_1');
                    }, 500);
                    helpers.translate('Authenticate - {0}', body.instanceUrl).then(result => {
                        let modalParams = api.state.registerInstanceModalParams;
                        modalParams.headerMessage = result;
                        api.setState('registerInstanceModalParams', JSON.parse(JSON.stringify(modalParams)));
                    
                    });
                }
                break;
            case 'CHECK_TARGET_OAUTH_SETUP':
                if (!response.result.ready) {
                    callUtilAPI({
                        operation: "CHECK_TARGET_OAUTH_ELIGIBLE",
                        instanceUrl: api.state.targetInstanceUrl,
                        addInstance: false
                    }, true)
                }
                else {
                    helpers.modal.close("data_loss_modal");
                    var iframeUrl = api.state.iFrameUrl;
                    iframeUrl = iframeUrl.replace(/&?oauthProf=[^&]*/g, '');
                    api.setState('newTargetUrl', api.state.targetInstanceUrl);
                    console.log('Response: ' + JSON.stringify(response.result));
                    iframeUrl += '&oauthProf=' + response.result.oauth_entity_profile;
                    api.setState('iFrameUrl', iframeUrl);
                    api.setState('programmaticCloseRegisterModal',true);
                    helpers.timing.setTimeout(() => {
                        _cacheRegisterInstanceModalParams();
                        helpers.modal.open('iframe_1');
                        helpers.translate('Authenticate - {0}', body.instanceUrl).then(result => {
                            let modalParams = api.state.registerInstanceModalParams;
                            modalParams.headerMessage = result;
                            api.setState('registerInstanceModalParams', JSON.parse(JSON.stringify(modalParams)));
                        
                        });
                    }, 500);
                }
                break;
            case 'CHECK_SOURCE_OAUTH_ELIGIBLE':
                if (response.result.isError) {
                    api.setState('newTargetUrl', '');
                    helpers.modal.close("register_instance");
                    helpers.timing.setTimeout(() => {
                        helpers.modal.open("source_authentication");
                    }, 500);
                } else {
                    helpers.modal.open("oauth_guidance_modal");
                    helpers.timing.setTimeout(()=>{
                        api.setState('newTargetUrl', body.instanceUrl);
                        api.setState("encryptedSourceUrl",response.result.sourceUrl);
                        helpers.translate('Authenticate - {0}', body.instanceUrl).then(result => {
                            let modalParams = api.state.registerInstanceModalParams;
                            modalParams.headerMessage = result;
                            api.setState('registerInstanceModalParams', JSON.parse(JSON.stringify(modalParams)));
                            api.setState("hideOauthErrorSetup", true);
                            api.setState('hideClientIDContainer', false);
                        });
                    },100);
                }
                break;
            case 'CHECK_TARGET_OAUTH_ELIGIBLE':
                if (response.result.isError) {
                    if (!body.addInstance) {
                        helpers.modal.close("data_loss_modal");
                        helpers.timing.setTimeout(() => {
                            openAuthenticationModal();
                        }, 500);
                    }
                    else {
                        if(response.result.isSelf) {
                            openErrorModal(response.result.message, 'Failed to Set up OAuth to ' + body.instanceUrl);
                        }
                        else {
                            api.setState('addInstanceUrl', body.instanceUrl);
                            api.setState('newTargetUrl', '');
                            helpers.modal.open("add_target_instance_modal");
                            helpers.modal.close("register_instance");
                        }
                    }
                } else {
                    var _url = body.instanceUrl + "/now/clone/ui/oauth-setup/" + response.result.sourceUrl;
                    if (!body.addInstance) {
                        helpers.timing.setTimeout(()=>{
                            api.setState('newTargetUrl', body.instanceUrl);
                            api.setState("encryptedSourceUrl",response.result.sourceUrl);
                        },100);
                        if(body.reset) {
                            openExternalPage(_url);
                        }
                        else {
                            helpers.modal.open("oauth_guidance_modal");
                            helpers.modal.close("data_loss_modal");
                        }
                    }
                    else {
                        openExternalPage(_url);
                    }
                    helpers.timing.setTimeout(()=>{
                        helpers.translate('Authenticate - {0}', body.instanceUrl).then(result => {
                            let modalParams = api.state.registerInstanceModalParams;
                            modalParams.headerMessage = result;
                            api.setState('registerInstanceModalParams', JSON.parse(JSON.stringify(modalParams)));
                            api.setState("hideOauthErrorSetup", true);
                            api.setState('hideClientIDContainer', false);
                        });
                    },100);
                }
                break;
            case 'IFRAME_CLOSED':
            case 'CHECK_OAUTH_TOKEN':
                if (response.result.ready) {
                    helpers.timing.clearInterval(body.intervalId);
                    api.setState("pollTokenIntervalId", null);
                    helpers.timing.setTimeout(() => {
                        if (body.addInstance) {
                            callUtilAPI({
                                operation: "ADD_OAUTH_INSTANCE",
                                instanceUrl: body.targetInstanceUrl,
                                registerInstance: true
                            }, true)
                        }
                        else if (body.authenticatingSourceInstance) {
                            callUtilAPI({
                                operation: "GET_CLONE_PROFILE_LIST_OAUTH",
                                instanceUrl: api.state.sourceInstanceUrl,
                            }, true);
                        }
                        else {
                            callUtilAPI({
                                operation: "INSTANCE_OAUTH",
                                instanceUrl: body.targetInstanceUrl,
                                registerInstance: false
                            }, true);
                        }
                    },500);
                }
                else if (response.result.cancelled) {
                    api.setState('programmaticCloseRegisterModal',false);
                    if (body.operation !== "IFRAME_CLOSED") {
                        helpers.timing.clearInterval(body.intervalId);
                        helpers.modal.close('iframe_1');
                    }
                    api.setState("hideOauthErrorSetup", false);
                    api.setState("oauthAddInstance",api.state.registerInstanceModalParams.oauthAddInstance);
                    api.setState("newTargetUrl",api.state.registerInstanceModalParams.newTargetUrl);
                    helpers.timing.setTimeout(()=> {
                        helpers.modal.open('register_instance');
                    },100);
                    /*if(api.state.authenticatingSourceInstance) {
                        api.setState("sourceInstanceName", api.state.prevSourceInstanceName);
                        api.setState("sourceInstanceId", api.state.prevSourceInstanceId);
                        api.setState("sourceInstanceUrl", api.state.prevSourceInstanceUrl);
                        api.setState("authenticatingSourceInstance", false);
                    }*/

                    authProcessHasEnded();
                }
                break;
            case 'ADD_OAUTH_INSTANCE':
                authProcessHasEnded();
                if (response.result.isError) {
                    api.setState("hideOauthErrorSetup", false);
                    helpers.modal.close('iframe_1');
                    helpers.modal.open('register_instance');
                } else {
                    api.setState("oauthAddInstance", false);
                    api.setState("hideOauthErrorSetup", true);
                    api.setState("showAddInstanceErrorMsg", false);
                    api.setState("showAddInstanceSuccessMsg", true);
                    api.setState("addInstanceSuccessMsg", body.instanceUrl + " is saved successfully");
                    clearRegisterInstanceModalValues();
                    callUtilAPI({
                        operation: "GET_TARGET_INSTANCES"
                    });
                }
                helpers.timing.setTimeout(()=> {
                    helpers.modal.close('register_instance');
                },100);
                break;
            case 'INSTANCE_OAUTH':
                authProcessHasEnded();
                api.setState("authenticateButtonLabel", api.state.text.Authenticate);
                api.setState("authenticatingTargetInstance", false);
                if (response.result.isError) {
                    api.setState("targetInstanceAuthenticationErrorMessage", response.result.message);
                    api.setState("showTargetInstanceAuthenticationErrorMessage", true);
                    api.setState("showTargetInstanceAuthenticationInfoMessage", false);
                    api.setState("disableActionButton", false);
                    api.setState("disableSubmitButton", false);
                    api.setState("hideOauthErrorSetup", false);
                    helpers.modal.close('iframe_1');
                    helpers.modal.open('register_instance');
                }
                else if (response.result.isEKMSError) {
                    helpers.modal.close("register_instance");
                    helpers.modal.close('iframe_1');
                    var errorMessage = response.result.ekmsErrorMessage;
                    var errorModalHeading = response.result.ekmsErrorHeading;
                    openErrorModal(errorMessage, errorModalHeading);
                }
                else {
                    helpers.modal.close("target_authentication_modal");
                    api.setState("targetInstanceUsername", "");
                    api.setState("targetInstancePassword", "");
                    api.setState("cloneReqSysId", response.result.cloneReqSysId);
                    api.setState("securityToken", response.result.securityToken);
                    clearRegisterInstanceModalValues();
                    addCloneRequest(response.result.cloneReqSysId, response.result.securityToken);
                }
                helpers.timing.setTimeout(()=> {
                    helpers.modal.close('register_instance');
                    helpers.modal.close("iframe_1");
                },100);
                break;
            case 'ADD_INSTANCE':
                if (response.result.isError) {
                    api.setState("showAddInstanceErrorMsg", true);
                    api.setState("addInstanceErrorMsg", "Unable to save the instance " + api.state.addInstanceUrl + ". Authentication failed: " + response.result.message);
                } else {
                    api.setState("showAddInstanceErrorMsg", false);
                    api.setState("showAddInstanceSuccessMsg", true);
                    api.setState("addInstanceSuccessMsg", body.instanceUrl + " is saved successfully");
                    callUtilAPI({
                        operation: "GET_TARGET_INSTANCES"
                    });
                }
                break;
            case "GET_TARGET_INSTANCES":
                if (response.result.isError) {
                    /* not yet coded */
                }
                else {
                    var targetInstances = response.result.items;
                    api.setState("targetInstances", targetInstances);
                    let targetInstanceAdded = targetInstances.find(({ instanceUrl }) => {
                        //return instanceUrl === api.state.addInstanceUrl 
                        var _instanceUrl = api.state.addInstanceUrl;
                        if (!_instanceUrl.startsWith("https://") && !_instanceUrl.startsWith("http://"))
                            _instanceUrl = "https://" + _instanceUrl;
                        return instanceUrl === _instanceUrl;
                    });
                    helpers.modal.close("add_target_instance_modal");
                    helpers.modal.close('iframe_1');
                    if (targetInstanceAdded) {
                        let _srcInstance = api.state.sourceInstances.find((el) => {
                            return el.id == targetInstanceAdded.id;
                        });
                        if (!_srcInstance) {
                            let _sourceInstances = JSON.parse(JSON.stringify(api.state.sourceInstances));
                            _sourceInstances.push(targetInstanceAdded);
                            api.setState("sourceInstances", _sourceInstances);
                        }
                        else if(_srcInstance.id == targetInstanceAdded.id) {
                            let _currInstance = api.state.sourceInstances.find((el) => {
                                return el.id == "currentInstance";
                            });
                            api.setState("sourceInstanceName", _currInstance.label);
                            api.setState("sourceInstanceId", _currInstance.id);
                            api.setState("sourceInstanceUrl", _currInstance.instanceUrl);
                        }
                        helpers.timing.setTimeout(() => {
                            changeTargetInstance(targetInstanceAdded.id, targetInstanceAdded.label, targetInstanceAdded.instanceUrl);
                        }, 500);
                    }
                }
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
                console.log("deyais: rowDefs{} " + JSON.stringify(rowDefinitions));
                api.setState("rowDefinitions", rowDefinitions);
                api.setState("table_name", api.state.model_table_name);
                helpers.modal.open("clone_definitions_modal");
                break;
            case 'CONFLICT_CALENDAR_ENTRIES':
                api.setState("calendarEntries", response.result);
                break;
            case 'GET_NEXT_AVAILABLE_SLOT':
                if (response.result.isError) {
                    openErrorModal(response.result.message.message.toString());
                    break;
                }
                api.setState("showEstimatedDuration", true);
                api.setState("estimatedStartDateTime", response.result.estimatedStartDateTime);
                api.setState("estimatedDuration", response.result.estimatedDuration);
                api.setState("estimatedDurationMs", response.result.estimatedDurationMs);
                api.setState("estimatedDurationInfoMessage", response.result.message);
                api.setState("onDemandBackupEstimationMessage", response.result.onDemandBackupEstimationMsg);
                api.setState("successModalInfoMessage", api.state.successModalInfoMessageLabel + response.result.estimatedDuration);
                api.setState("estimatedDurationMessage", api.state.estimatedDurationLabel + ": " + response.result.estimatedDuration);
                api.setState("estimatedCloneEndTime", response.result.estimatedCloneEndTime);
                api.setState("cloneStartTimeTooltip", response.result.relativeTimeTooltip);
                computeRelativeTimeTooltip(response.result.estimatedStartDateTime, response.result.serverCurrentTime, response.result.estimatedDurationMs, body.targetInstanceId);
                var frequencyCard = JSON.parse(JSON.stringify(api.state.frequencyCard));
                frequencyCard.maxRecurringCloneDuration = response.result.maxRecurringCloneDuration;
                api.setState("frequencyCard", frequencyCard);
                api.setState("validationRules", response.result.validation_rules);
                api.setState("largeTablesList", response.result.largeTablesList);
                //conflict calendar entry
                api.setState("nextAvailableTimeSlot", {
                    "start": response.result.estimatedStartDateTime,
                    "end": response.result.estimatedStartDateTime,
                    "type": "available"
                });
                api.setState("disableCloneScheduleStartTime", false);
                var params = {
                    "frequencyCard": frequencyCard,
                    "estimatedStartDateTime": response.result.estimatedStartDateTime,
                    "targetInstanceId": body.targetInstanceId
                };
                validateCloneRequest(params);
                break;
            case 'GET_CLONE_PROFILE':
                var _cloneProfileData = response.result;

                // Open the modal FIRST if there is a target override, so the overlay
                // covers the page while the profile data re-renders happen behind it.
                if (_cloneProfileData.target_instance) {
                    var _currentTargetId = api.state.targetInstanceId;
                    var _newTargetId = _cloneProfileData.target_instance;
                    if (_currentTargetId && _currentTargetId !== "" && _currentTargetId !== _newTargetId) {
                        var _currentTarget = api.state.targetInstances.find((el) => el.id == _currentTargetId);
                        var _newTarget = api.state.targetInstances.find((el) => el.id == _newTargetId);
                        if (_currentTarget && _newTarget) {
                            var _bodyTemplate = (api.state.text && api.state.text.TargetOverrideBody)
                                ? api.state.text.TargetOverrideBody
                                : 'The profile you selected includes a default target instance. Your target has been updated from {0} to {1}.';
                            api.setState('targetOverrideModalBody', _bodyTemplate.replace('{0}', _currentTarget.label).replace('{1}', _newTarget.label));
                            helpers.modal.open("target_override_modal");
                        }
                    }
                }

                api.setState('exclusionsCount', _cloneProfileData.exclusionsCount);
                api.setState('preserversCount', _cloneProfileData.preserversCount);
                api.setState('cleanupScriptsCount', _cloneProfileData.cleanupScriptsCount);
                api.setState('amount_of_data_copied_from_large_tables', _cloneProfileData.amount_of_data_copied_from_large_tables);
                api.setState('backupTypeFromCloneProfileDefaultSelectedItem', _cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem);
                api.setState('backupTypeFromCloneRequestSelectedItemId', _cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem);
                api.setState('default_profile', _cloneProfileData.default_profile);
                api.setState('name', _cloneProfileData.name);
                api.setState('target_instance', _cloneProfileData.target_instance);
                api.setState('header', _cloneProfileData.header);
                api.setState('modalDeleteMessageText', _cloneProfileData.modalDeleteMessageText);
                api.setState('dataCopyItems', _cloneProfileData.dataCopyItems);
                api.setState('backupTypeForCloneProfileItems', _cloneProfileData.backupTypeForCloneProfileItems);
                api.setState('updateSetItems', _cloneProfileData.updateSetItems);
                api.setState('hasCustomPreserver', _cloneProfileData.hasCustomPreserver || {
                    isCustom: false
                });
                var _backupTypeFromCloneRequestSelectedItemLabel = api.state.backupTypeFromCloneRequest.find((el) => {
                    return el.id == _cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem;
                });
                if (!_backupTypeFromCloneRequestSelectedItemLabel)
                    _backupTypeFromCloneRequestSelectedItemLabel = { label: api.state.backupTypeFromCloneRequest[0].label };

                api.setState("defaultBackupTypeFromCloneRequest", _cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem); //TODO
                api.setState("defaultBackupTypeFromCloneRequestLabel", _backupTypeFromCloneRequestSelectedItemLabel.label);
                api.setState("backupTypeFromCloneRequestSelectedItemLabel", _backupTypeFromCloneRequestSelectedItemLabel.label);

                var _amountOfDataCopied90Days = (_cloneProfileData.amount_of_data_copied_from_large_tables == "last_90_days");
                api.setState('highlightText', "Selecting 'Last 90 days' can increase clone time.");
                api.setState('highlightTextShow', _amountOfDataCopied90Days ? true : false);

                api.setState("amountOfDataCopiedFromLargeTablesSummaryLabel", _amountOfDataCopied90Days ? api.state.text.Last_90_days : api.state.text.Full);
                if (!api.state.userHasInteracted || !api.state.initialLoadComplete) {
                    api.setState('exclude_all_from_exclusion_list', _cloneProfileData.exclude_all_from_exclusion_list);
                    api.setState('exclude_large_data', _cloneProfileData.exclude_large_data);
                    api.setState('filter_attachment_data', _cloneProfileData.filter_attachment_data);
                    api.setState('preserve_theme', _cloneProfileData.preserve_theme);
                    api.setState('preserve_in_progress_update_sets', _cloneProfileData.preserve_in_progress_update_sets);
                    api.setState("excludeTablesSpecifiedInExclusionListSummaryValue", String(_cloneProfileData.exclude_all_from_exclusion_list) === "true" ? api.state.text.Yes : api.state.text.No);
                    api.setState("excludeAuditAndLogDataSummaryValue", String(_cloneProfileData.exclude_large_data) === "true" ? api.state.text.Yes : api.state.text.No);
                    api.setState("excludeAttachmentDataSummaryValue", String(_cloneProfileData.filter_attachment_data) === "true" ? api.state.text.Yes : api.state.text.No);
                    api.setState("preserverThemeSummaryValue", String(_cloneProfileData.preserve_theme) === "true" ? api.state.text.Yes : api.state.text.No);
                    api.setState('preserveInProgressGlobalUpdateSetsSummaryValue', _cloneProfileData.preserve_in_progress_update_sets == "last_90_days" ? api.state.text.Last_90_days : api.state.text.None);
                    api.setState('initialLoadComplete', true);
                }
                if (_cloneProfileData.target_instance) {
                    var currentTargetId = api.state.targetInstanceId;
                    var newTargetId = _cloneProfileData.target_instance;

                    api.setState('targetInstanceId', newTargetId);
                    var _targetInstance = api.state.targetInstances.find((el) => {
                        return el.id == newTargetId;
                    });
                    if (_targetInstance) {
                        api.setState('isCloneProfileSelected', true);
                        helpers.timing.setTimeout(() => {
                            api.emit('DEFAULT_TARGET_SET', {
                                value: _targetInstance.id,
                                item: {
                                    label: _targetInstance.label,
                                    instanceUrl: _targetInstance.instanceUrl
                                }
                            });
                        }, 500);
                    }
                }
                break;
            case 'GET_CLONE_PROFILE_LIST_OAUTH':
            case 'GET_CLONE_PROFILE_LIST':
                authProcessHasEnded();
                if (response.result.isError) {
                    if (body.operation == "GET_CLONE_PROFILE_LIST_OAUTH") {
                        helpers.modal.close('iframe_1');
                        api.setState("hideOauthErrorSetup", false);
                        helpers.modal.open('register_instance');
                    }
                    else {
                        showSourceInstanceAuthenticationError(response.result.errorMessage || response.result.message);
                    }
                    api.setState("authenticatingSourceInstance", true);
                }
                else {
                    let cloneProfiles = [{
                        label: api.state.text.None,
                        id: ""
                    }];
                    // Default clone profile to None
                    var cloneProfileName = api.state.text.None;
                    var defaultRemoteProfileData = {};
                    var cloneProfile = "";
                    response.result.profiles.forEach((profile) => {
                        cloneProfiles.push({
                            ...profile,
                            id: profile.sysId,
                            label: profile.name,
                            isByOAuth: response.result.isByOAuth
                        });
                        if (profile.default_profile == 'true') {
                            cloneProfile = profile.sysId;
                            cloneProfileName = profile.name;
                            defaultRemoteProfileData = profile;
                        }
                    });
                    api.setState("authenticatingSourceInstance", false);
                    api.setState("defaultRemoteProfileData", defaultRemoteProfileData);
                    api.setState("cloneProfile", cloneProfile);
                    api.setState("cloneProfileName", cloneProfileName);
                    api.setState("cloneProfiles", cloneProfiles);
                    filterTargetInstance();
                    populateCloneProfileData(cloneProfile, defaultRemoteProfileData, '', response.result.isByOAuth);
                    clearRegisterInstanceModalValues();
                    helpers.timing.setTimeout(() => {
                        helpers.modal.close("source_authentication");
                        helpers.modal.close("iframe_1");
                        helpers.modal.close("register_instance");
                    }, 800);
                }
                break;
            case 'GET_DEFINITIONS_REMOTE_INSTANCE_DATA_BY_OAUTH':
            case 'GET_DEFINITIONS_REMOTE_INSTANCE_DATA':
                authProcessHasEnded();
                if (response.result.isError) {
                    showCloneRequestFormError(response.result.errorMessage || response.result.message);
                    break;
                }

                closeCloneRequestFormError(); // Close previous error message

                api.setState("cloudDetails", response.result);

                api.setState("exclusionsCount", response.result.exclusion.count);
                api.setState("preserversCount", response.result.preserver.count);
                api.setState("cleanupScriptsCount", response.result.cleanupScript.count);

                api.setState("exclusionsTableLink", response.result.exclusion.link);
                api.setState("preserversTableLink", response.result.preserver.link);
                api.setState("cleanupScriptsTableLink", response.result.cleanupScript.link);

                break;
            case 'CHECK_SLOT_AVAILABILITY':
                params = {};
                if (response.result.isError) {
                    api.setState("showConflictCalendarMessage", true);
                    params.showConflictCalendarMessage = true;
                    api.setState("conflictCalendarMessage", response.result.message);
                    api.setState('cloneStartTimeTooltip', response.result.message);
                    api.setState("showEstimatedCompletionTime", false);
                } else {
                    api.setState("estimatedStartDateTime", response.result.estimatedStartDateTime);
                    params.estimatedStartDateTime = response.result.estimatedStartDateTime;
                    api.setState("showConflictCalendarMessage", false);
                    params.showConflictCalendarMessage = false;
                    api.setState("estimatedDuration", response.result.estimatedDuration);
                    api.setState("estimatedDurationMs", response.result.estimatedDurationMs);
                    api.setState("estimatedDurationInfoMessage", response.result.message);
                    api.setState("onDemandBackupEstimationMessage", response.result.onDemandBackupEstimationMsg);
                    api.setState("successModalInfoMessage", api.state.successModalInfoMessageLabel + response.result.estimatedDuration);
                    api.setState("estimatedDurationMessage", api.state.estimatedDurationLabel + ": " + response.result.estimatedDuration);
                    api.setState("estimatedCloneEndTime", response.result.estimatedCloneEndTime);
                    api.setState("cloneStartTimeTooltip", response.result.relativeTimeTooltip);
                    computeRelativeTimeTooltip(response.result.estimatedStartDateTime, response.result.serverCurrentTime, response.result.estimatedDurationMs, body.targetInstanceId);
                    var frequencyCard = JSON.parse(JSON.stringify(api.state.frequencyCard));
                    frequencyCard.maxRecurringCloneDuration = response.result.maxRecurringCloneDuration;
                    api.setState("frequencyCard", frequencyCard);
                    params.frequencyCard = frequencyCard;
                    api.setState("validationRules", response.result.validation_rules);
                    api.setState("largeTablesList", response.result.largeTablesList);
                }
                validateCloneRequest(params);
                break;
            case 'GET_SYS_USERS':
                api.setState("users", response.result || []);
                break;
            case 'GET_ESTIMATED_CLONE_FREQUENCY_END_DATE':
                var frequencyCard = body.frequencyCard;
                frequencyCard.estimatedEndDateValue = response.result.estimatedSeriesEndDate;
                frequencyCard.estimatedEndDate = frequencyCard.estimatedEndDateLabelText + frequencyCard.estimatedEndDateValue;
                api.setState('frequencyCard', frequencyCard);
                validateCloneRequest({ "frequencyCard": frequencyCard });
                break;
            case 'GET_MAX_CLONE_OCCURRENCES':
                var frequencyCard = body.frequencyCard;
                frequencyCard.occurrences.maxCount = response.result.maxCloneOccurrences;
                frequencyCard.occurrences.label = frequencyCard.occurrences.labelText + frequencyCard.occurrences.maxCount;
                api.setState('frequencyCard', frequencyCard);
                validateCloneRequest({ "frequencyCard": frequencyCard });
                break;
            case 'RUN_PREFLIGHT_CHECK':
                if (response.result.isError && response.result.errorType == 'error') {
                    api.setState("showEstimatedDurationSummaryInfo", false);
                    api.setState("showPreflightErrorMessage", true);
                    api.setState("disableSubmitButton", true);
                    api.setState("preflightErrorMessage", response.result.message);
                } else if (response.result.isError && response.result.errorType == 'warning') {
                    api.setState("showEstimatedDurationSummaryInfo", true);
                    api.setState("showPreflightWarningMessage", true);
                    api.setState("preflightWarningMessage", response.result.message);
                } else {
                    api.setState("showEstimatedDurationSummaryInfo", true);
                }
                showSummary();
                break;
            case 'INSTANCE_AUTH':
                api.setState("authenticateButtonLabel", api.state.text.Authenticate);
                api.setState("authenticatingTargetInstance", false);
                if (response.result.isError) {
                    api.setState("targetInstanceAuthenticationErrorMessage", response.result.message);
                    api.setState("showTargetInstanceAuthenticationErrorMessage", true);
                    api.setState("showTargetInstanceAuthenticationInfoMessage", false);
                    api.setState("disableActionButton", false);
                    api.setState("disableSubmitButton", false);
                }
                else if (response.result.isEKMSError) {
                    helpers.modal.close("target_authentication_modal");
                    var errorMessage = response.result.ekmsErrorMessage;
                    var errorModalHeading = response.result.ekmsErrorHeading;
                    openErrorModal(errorMessage, errorModalHeading);
                }
                else {
                    helpers.modal.close("target_authentication_modal");
                    api.setState("targetInstanceUsername", "");
                    api.setState("targetInstancePassword", "");
                    api.setState("cloneReqSysId", response.result.cloneReqSysId),
                    api.setState("securityToken", response.result.securityToken)
                    addCloneRequest(response.result.cloneReqSysId, response.result.securityToken);
                }
                break;
            case 'CREATE_CLONE_REQUEST':
                api.setState("disableActionButton", false);
                api.setState("disableSubmitButton", false);
                if (!!response.result && !!response.result.cloneRequestId) {
                    api.setState("successMessage", '');
                    api.setState("createdCloneRequestId", response.result.cloneRequestId);
                    helpers.modal.open("success_modal");
                } else {
                    openErrorModal(response.result.error);
                }
                break;
            case 'GET_ADJACENT_CLONES':
                if (response.result.isAdjacentClones && !response.result.isError) {
                    api.setState("isAdjacentClone", true);
                    api.setState("listOfAdjacentClones", response.result.message);
                    api.setState("adjacentClonesGeneralDescription", response.result.adjacentClonesGeneralDescription);
                } else {
                    api.setState("isAdjacentClone", false);
                }
                break;
        }
        loaderComponent(false);

    }

    function addCloneRequest(cloneReqSysId, securityToken) {
        var cloneRequestData = {
            source_instance: api.state.sourceInstanceId == "currentInstance" ? null : api.state.sourceInstanceId,
            target_instance: api.state.targetInstanceId,
            clone_profile: api.state.sourceInstanceId == "currentInstance" ? api.state.cloneProfile : "",
            clone_profile_name: api.state.cloneProfileName == api.state.text.None ? "" : api.state.cloneProfileName,
            lock_profile_settings: api.state.lockSettings,
            estimated_start_date_time: api.state.estimatedStartDateTime,
            estimated_duration: api.state.estimatedDurationMs,
            email_upon_completion: parseEmailUponCompletionId(api.state.selectedUsers, api.state.externalEmails),
            amount_of_data_copied_from_large_tables: api.state.amount_of_data_copied_from_large_tables,
            exclude_all_from_exclusion_list: api.state.exclude_all_from_exclusion_list,
            exclude_large_data: api.state.exclude_large_data,
            filter_attachment_data: api.state.filter_attachment_data,
            on_demand_backup: api.state.backupTypeFromCloneRequestSelectedItemId == 'use_recent_backup' ? false : true,
            preserve_in_progress_update_sets: api.state.preserve_in_progress_update_sets == "none" ? null : api.state.preserve_in_progress_update_sets,
            preserve_theme: api.state.preserve_theme,
            cloud_details: api.state.cloudDetails,
            frequency: api.state.frequencyCard.cloneFrequency.selected == 0 ? null : api.state.frequencyCard.cloneFrequency.selected,
            occurrences: api.state.frequencyCard.occurrences.count,
            selectedDayOfWeek: api.state.frequencyCard.weeklyBiweekly.day,
            username: api.state.targetInstanceUsername,
            password: api.state.targetInstancePassword,
            cloneReqSysId: cloneReqSysId,
            securityToken: securityToken,
            backup_type: api.state.backupTypeFromCloneRequestSelectedItemId,
            clone_request_id_for_backup: api.state.cloneRequestIdSelectedItemId
        };
        callUtilAPI({
            operation: "CREATE_CLONE_REQUEST",
            cloneRequestData: cloneRequestData
        }, true);

    }

    function parseEmailUponCompletionId(emailUponCompletionValue, externalEmails) {
        var emailUponCompletionId = "";
        for (var index = 0; index < emailUponCompletionValue.length; index++) {
            emailUponCompletionId += emailUponCompletionValue[index].id;
            if (index !== (emailUponCompletionValue.length - 1)) {
                emailUponCompletionId += ",";
            }
        }
        if (externalEmails) {
            var _externalEmails = removeWhiteSpaces(externalEmails.split(','));
            emailUponCompletionId += emailUponCompletionId ? ',' + _externalEmails.join(',') : _externalEmails.join(',');
        }

        return emailUponCompletionId ? removeDuplicates(emailUponCompletionId.split(',')).join(',') : '';
    }

    function removeDuplicates(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }

    function closeSourceInstanceAuthenticationError() {
        api.setState("showSourceInstanceAuthenticationErrorMessage", false);
        api.setState("sourceInstanceAuthenticationErrorMessage", "");
    }

    function showSourceInstanceAuthenticationError(errorMessage) {
        api.setState("showSourceInstanceAuthenticationErrorMessage", true);
        api.setState("sourceInstanceAuthenticationErrorMessage", errorMessage || api.state.text.GenericErrorMessage);
    }

    function showCloneRequestFormError(errorMessage) {
        api.setState("showCloneRequestFormError", true);
        api.setState("cloneRequestFormError", errorMessage || api.state.text.GenericErrorMessage);
    }

    function closeCloneRequestFormError() {
        api.setState("showCloneRequestFormError", false);
        api.setState("cloneRequestFormError", "");
    }

    function validateCloneRequest(params) {
        params = checkFields(params);
        api.setState("disableContinuebutton", false);

        if (!params.targetInstanceId) {
            api.setState("disableContinuebutton", true);
        }

        if (!params.estimatedStartDateTime || params.showConflictCalendarMessage) {
            api.setState("disableContinuebutton", true);
        }
        var frequencyCard = params.frequencyCard;
        if (frequencyCard.cloneFrequency.selected != '0') {
            if (!frequencyCard.occurrences.count || frequencyCard.occurrences.count <= 0 || frequencyCard.occurrences.count > frequencyCard.occurrences.maxCount) {
                api.setState("disableContinuebutton", true);
            }
        }

        if (frequencyCard.weeklyBiweekly.day == 0) {
            api.setState("disableContinuebutton", true);
        }

        if (params.externalEmails.length > 0) {
            var regexEmailValidator = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            var _invalidEmails = [];
            var _externalEmails = params.externalEmails;
            var _regex = /;/gi;
            _externalEmails.replaceAll(_regex, ',');
            _externalEmails = _externalEmails.split(',');
            for (var i in _externalEmails) {
                var _email = _externalEmails[i].trim();
                if (_email) {
                    if (!regexEmailValidator.test(_email)) {
                        api.setState("disableContinuebutton", true);
                        _invalidEmails.push(_email);
                    }
                }
            }
            if (_invalidEmails.length > 0)
                api.setState("disableContinuebutton", true);
        }
    }
    function checkFields(params) {
        if (params.targetInstanceId === undefined) {
            params.targetInstanceId = api.state.targetInstanceId;
        }
        if (params.estimatedStartDateTime === undefined) {
            params.estimatedStartDateTime = api.state.estimatedStartDateTime;
        }
        if (params.showConflictCalendarMessage === undefined) {
            params.showConflictCalendarMessage = api.state.showConflictCalendarMessage;
        }
        if (params.frequencyCard === undefined) {
            params.frequencyCard = api.state.frequencyCard;
        }
        if (params.externalEmails === undefined) {
            params.externalEmails = api.state.externalEmails;
        }

        return params;
    }
    function resetControls() {
        api.setState('cloneRequestSelectionContainerShow', false);
    }
    function resetControlsForFrequencyCard(frequencyCard) {
        //resetDays();
        frequencyCard.weeklyBiweekly.show = false;
        frequencyCard.occurrences.show = false;
        frequencyCard.estimatedEdnDateShow = false;
        frequencyCard.occurrences.count = "";
        frequencyCard.occurrences.label = frequencyCard.occurrences.labelText;
        api.setState('frequencyCard', frequencyCard);
    }

    function getEstimatedSeriesEndDate(frequencyCard) {
        var day = 0;
        callUtilAPI({
            operation: 'GET_ESTIMATED_CLONE_FREQUENCY_END_DATE',
            requestedTime: api.state.estimatedStartDateTime == "-" ? "" : api.state.estimatedStartDateTime,
            cloneFrequency: frequencyCard.cloneFrequency.selected,
            numberOfOccurrences: frequencyCard.occurrences.count,
            days: day,
            frequencyCard: frequencyCard
        });
    }
    function getMaxCloneOccurrences(frequencyCard) {
        callUtilAPI({
            operation: 'GET_MAX_CLONE_OCCURRENCES',
            maxRecurringCloneDuration: frequencyCard.maxRecurringCloneDuration,
            frequency: frequencyCard.cloneFrequency.selected,
            frequencyCard: frequencyCard
        });
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
            targetInstanceId: api.state.targetInstanceId
        }, false);
    }

    function openAuthenticationModal() {
        api.setState("authenticateButtonLabel", api.state.text.Authenticate);
        api.setState("authenticatingTargetInstance", false);
        api.setState("showTargetInstanceAuthenticationErrorMessage", false);
        api.setState("showTargetInstanceAuthenticationInfoMessage", true);
        helpers.modal.open("target_authentication_modal");
    }

    function runPreflightChecks() {
        if (api.state.sourceInstanceId != "currentInstance") {
            api.setState("showEstimatedDurationSummaryInfo", true);
            showSummary();
        } else {
            callUtilAPI({
                operation: 'RUN_PREFLIGHT_CHECK',
                cloneProfileSysId: api.state.cloneProfile,
                validationRules: api.state.validationRules,
                largeTablesList: api.state.largeTablesList
            }, true);
        }
        helpers.timing.setTimeout(() => {
            getAdjacentClones();
        }, 500);
    }

    function getAdjacentClones() {
        callUtilAPI({
            operation: 'GET_ADJACENT_CLONES',
            targetInstanceSysId: api.state.targetInstanceId,
            scheduledTime: api.state.estimatedStartDateTime
        }, true);
    }

    function showSummary() {
        api.setState("showRequestForm", false);
        api.setState("showSummaryForm", true);

        var lockSettingsSummaryValue = api.state.lockSettings == true ? api.state.text.Yes : api.state.text.No;
        api.setState("lockSettingsSummaryValue", lockSettingsSummaryValue);

        var numberOfOccurrencesSummaryValue = !api.state.frequencyCard.occurrences.count ? api.state.text.NumberZero : api.state.frequencyCard.occurrences.count;
        api.setState("numberOfOccurrencesSummaryValue", numberOfOccurrencesSummaryValue);

        api.setState("authenticateTargetHeader", api.state.authenticateTargetHeaderLabel + api.state.targetInstanceName);

        var basicDetail1 = [{
            "label": "Clone profile",
            "value": {
                "type": "string",
                "value": api.state.cloneProfileName
            }
        },
        {
            "label": "Lock settings at time of clone request",
            "value": {
                "type": "string",
                "value": lockSettingsSummaryValue
            }
        },
        {
            "label": " ",
            "value": {
                "type": "string",
                "value": " "
            }
        }
        ];

        var basicDetails2 = [{
            "label": "Source Instance",
            "value": {
                "type": "string",
                "value": api.state.sourceInstanceName
            }
        },
        {
            "label": "Target Instance",
            "value": {
                "type": "string",
                "value": api.state.targetInstanceName
            }
        },
        {
            "label": "Clone Scheduled Start Time",
            "value": {
                "type": "string",
                "value": api.state.estimatedStartDateTime
            }
        }
        ];
        var basicDetails3 = [{
            "label": "Exclusions",
            "value": [{
                "type": "text-link",
                "label": api.state.exclusionsCount,
                "href": "javascript: 'javascript:void(0)'",
                "underlined": true,
                "table": "clone_profile_exclusions",
                "rowName": "exclusion",
                "tableLable": "Exclusions"
            }]
        },
        {
            "label": "Preservers",
            "value": [{
                "type": "text-link",
                "label": api.state.preserversCount,
                "href": "javascript: 'javascript:void(0)'",
                "underlined": true,
                "table": "clone_profile_preservers",
                "rowName": "preserver",
                "tableLable": "Preservers"
            }]
        },
        {
            "label": "Cleanup Scripts",
            "value": [{
                "type": "text-link",
                "label": api.state.cleanupScriptsCount,
                "href": "javascript: 'javascript:void(0)'",
                "underlined": true,
                "table": "clone_profile_cleanup_scripts",
                "rowName": "cleanup_script",
                "tableLable": "Cleanup Scripts"
            }]
        }
        ];
        var basicDetails4 = [{
            "label": "Email Upon Completion",
            "value": [{
                "type": "string",
                "value": api.state.emailUponCompletionSummaryValue
            }]
        }];

        var exclusionSettingValues = [{
            "label": "Exclude tables specified in Exclusion List",
            "value": {
                "type": "string",
                "value": api.state.excludeTablesSpecifiedInExclusionListSummaryValue
            }
        },
        {
            "label": "Exclude audit and log data",
            "value": {
                "type": "string",
                "value": api.state.excludeAuditAndLogDataSummaryValue
            }
        },
        {
            "label": "Exclude attachment data",
            "value": {
                "type": "string",
                "value": api.state.excludeAttachmentDataSummaryValue
            }
        }
        ];
        var preserverSettingValues = [{
            "label": "Preserver Theme",
            "value": {
                "type": "string",
                "value": api.state.preserverThemeSummaryValue
            }
        },
        {
            "label": "Preserve in Progress Global Update Sets",
            "value": {
                "type": "string",
                "value": api.state.preserveInProgressGlobalUpdateSetsSummaryValue
            }
        }
        ];

        var otherSettingsValue1 = [{
            "label": "Amount of data copied from the Task table",
            "value": {
                "type": "string",
                "value": api.state.amountOfDataCopiedFromLargeTablesSummaryLabel
            }
        },
        {
            "label": "Backup selection",
            "value": {
                "type": "string",
                "value": api.state.backupTypeFromCloneRequestSelectedItemLabel
            }
        },
        {
            "label": "No. of Occurrences",
            "value": {
                "type": "string",
                "value": numberOfOccurrencesSummaryValue
            }
        }
        ];

        var otherSettingsValue2 = [{
            "label": "Clone Frequency",
            "value": {
                "type": "string",
                "value": api.state.cloneFrequencySummaryValue
            }
        }];
        if (api.state.cloneRequestIdSelectedItemLabel) {
            otherSettingsValue2.push({
                "label": "Use the same backup as another clone request",
                "value": {
                    "type": "string",
                    "value": api.state.cloneRequestIdSelectedItemLabel
                }
            });
        }
        api.setState("basicDetails1", basicDetail1);
        api.setState("basicDetails2", basicDetails2);
        api.setState("basicDetails3", basicDetails3);
        api.setState("basicDetails4", basicDetails4);
        api.setState("exclusionSettingValues", exclusionSettingValues);
        api.setState("preserverSettingValues", preserverSettingValues);
        api.setState("otherSettingsValue1", otherSettingsValue1);
        api.setState("otherSettingsValue2", otherSettingsValue2);

    }



    return {
        openDefinitionsModal,
        filterTargetInstance,
        changeTargetInstance,
        populateCloneProfileData,
        closeSourceInstanceAuthenticationError,
        callUtilAPI,
        getCalendarConflictEntries,
        joinInternalExternalEmails,
        parseEmailUponCompletionValue,
        validateCloneRequest,
        openExternalPage,
        resetControls,
        resetControlsForFrequencyCard,
        getEstimatedSeriesEndDate,
        getMaxCloneOccurrences,
        openAuthenticationModal,
        runPreflightChecks
    };
}
