/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        targetInstances,
        sourceInstances,
        cloneProfiles,
        users,
        cloneRequestData,
        cloneProfileData,
        preSelectedDefaultProfile,
        currentUser,
        cloneRequestId,
        iframeUrl
        
    } = api.data.clone_request_page_data_1.output;
    var text = cloneRequestData.text;
    var cloneProfile = preSelectedDefaultProfile || '';
    var cloneProfileName = cloneProfileData.name || text.None;
    var defaultCloneProfiles = [{
        label: text.None,
        id: ''
    }].concat(cloneProfiles);
    var selectedUsers = [],
        _users = JSON.parse(JSON.stringify(users));
    var _currUser = users.find((el) => {
        return el.id == currentUser.id;
    });
    if (!_currUser && currentUser.label) {
        _users.push(currentUser);
    }
    const generateAriaAttributes = (label) => {
        return {
            button: {
                "aria-label": label
            }
        };
    };
    function setAriaLabel(
        ariaLabelKey,
        count,
        clientParamName
    ) {
        helpers.translate(ariaLabelKey, [count])
            .then((translatedText) => {
                const labelObj = generateAriaAttributes(translatedText);
                api.setState(clientParamName, labelObj);
            });
    }
    api.setState('iFrameUrl',iframeUrl)
    api.setState('disableContinuebutton', true);
    api.setState('typeaheadValue', '');
    api.setState('users', _users);
    api.setState("defaultCloneProfiles", defaultCloneProfiles);
    api.setState('cloneProfiles', defaultCloneProfiles);
    api.setState('targetInstances', targetInstances);
    api.setState('defaultTargetInstances', targetInstances);
    api.setState('conflictCalendarMessage', "");
    api.setState('showAddInstanceSuccessMsg', false);
    api.setState('addInstanceSuccessMsg', "");
    api.setState('sourceInstances', sourceInstances);
    api.setState('text', cloneRequestData.text);
    api.setState('cloneRequestId', cloneRequestId);
    api.setState('nextAvailableTimeSlot', {});
    api.setState('sourceInstanceId', "currentInstance");
    api.setState('currentUser', currentUser);
    api.setState("authenticateTargetHeaderLabel", cloneRequestData.authenticateTargetHeader);
    api.setState("externalEmails", '');
    api.setState("internalEmails", '');
    api.setState("estimatedStartDateTime", '');
    api.setState("estimatedDuration", "");
    api.setState("showEstimatedDuration", false);
    api.setState("showEstimatedCompletionTime", false);
    api.setState("showExternalEmailInfoMsg", false);
    api.setState("showExternalEmailInfo", false);
    api.setState("showInvalidEmailMessage", false);
    //cloneProfileData details
    if (cloneProfileData) {
        api.setState('targetInstanceId', cloneProfileData.target_instance || '');
        api.setState('exclusionsCount', cloneProfileData.exclusionsCount);
        api.setState('preserversCount', cloneProfileData.preserversCount);
        api.setState('cleanupScriptsCount', cloneProfileData.cleanupScriptsCount);
        setAriaLabel('Exclusion ARIA label', cloneProfileData.exclusionsCount, 'exclusionsCountLabel');
        setAriaLabel('Preserver ARIA label', cloneProfileData.preserversCount, 'preserversCountLabel');
        setAriaLabel('CleanupScript ARIA label', cloneProfileData.cleanupScriptsCount, 'cleanupScriptsCountLabel');
        api.setState('amount_of_data_copied_from_large_tables', cloneProfileData.amount_of_data_copied_from_large_tables);
        api.setState('backupTypeFromCloneProfileDefaultSelectedItem', cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem);
        api.setState('backupTypeFromCloneRequestSelectedItemId', cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem);
        api.setState('default_profile', cloneProfileData.default_profile);
        api.setState('exclude_all_from_exclusion_list', cloneProfileData.exclude_all_from_exclusion_list);
        api.setState('exclude_large_data', cloneProfileData.exclude_large_data);
        api.setState('filter_attachment_data', cloneProfileData.filter_attachment_data);
        api.setState('name', cloneProfileData.name);
        api.setState('preserve_in_progress_update_sets', cloneProfileData.preserve_in_progress_update_sets);
        api.setState('preserve_theme', cloneProfileData.preserve_theme);
        api.setState('target_instance', cloneProfileData.target_instance);
        api.setState('header', cloneProfileData.header);
        api.setState('modalDeleteMessageText', cloneProfileData.modalDeleteMessageText);
        api.setState('dataCopyItems', cloneProfileData.dataCopyItems);
        api.setState('backupTypeForCloneProfileItems', cloneProfileData.backupTypeForCloneProfileItems);
        api.setState('updateSetItems', cloneProfileData.updateSetItems);
        api.setState('hasCustomPreserver', cloneProfileData.hasCustomPreserver || {
            isCustom: false
        });
    }

    var _backupTypeFromCloneRequestSelectedItemLabel = cloneRequestData.backupTypeForCloneRequestItems.find((el) => {
        return el.id == cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem;
    });
    if (!_backupTypeFromCloneRequestSelectedItemLabel)
        _backupTypeFromCloneRequestSelectedItemLabel = {
            label: cloneRequestData.backupTypeForCloneRequestItems[0].label
        };
    //cloneRequestData details
    api.setState("backupTypeFromCloneRequest", cloneRequestData.backupTypeForCloneRequestItems);
    api.setState("defaultBackupTypeFromCloneRequest", cloneProfileData.backupTypeFromCloneProfileDefaultSelectedItem); //TODO
    api.setState("defaultBackupTypeFromCloneRequestLabel", _backupTypeFromCloneRequestSelectedItemLabel.label);
    api.setState("backupTypeFromCloneRequestSelectedItemLabel", _backupTypeFromCloneRequestSelectedItemLabel.label);
    api.setState("backupTypeFromCloneProfile", cloneRequestData.backupTypeForCloneProfileItems);
    api.setState("estimatedDurationInfoMessage", cloneRequestData.estimatedDurationInfoMessage);
    api.setState("estimatedDurationLabel", cloneRequestData.estimatedDurationLabel);
    api.setState("estimatedCompletionLabel", cloneRequestData.estimatedCompletionLabel);
    api.setState("successModalInfoMessageLabel", cloneRequestData.successModalInfoMessage);
    api.setState("authenticateTargetHeader", cloneRequestData.authenticateTargetHeader);
    api.setState("today", cloneRequestData.today);
    api.setState("timeZone", cloneRequestData.timeZone);
    api.setState("errorMessage", cloneRequestData.errorMessage);
    api.setState("dataCopyItems", cloneRequestData.dataCopyItems);
    api.setState("updateSetItems", cloneRequestData.updateSetItems);
    api.setState("text", cloneRequestData.text || {});

    api.setState("sourceInstanceName", text.Current_instance);
    api.setState("targetInstanceName", text.None);
    api.setState("emailUponCompletionSummaryValue", text.None);
    api.setState("cloneProfileName", cloneProfileName);
    api.setState("cloneProfile", cloneProfile);
    api.setState("defaultCloneProfile", cloneProfile);
    api.setState("defaultCloneProfileName", cloneProfileName);

    var frequencyCard = cloneRequestData.frequencyCard;
    frequencyCard.occurrences.labelText = frequencyCard.occurrences.label;
    frequencyCard.estimatedEndDateLabelText = frequencyCard.estimatedEndDateLabel;
    frequencyCard.cloneFrequency.selected = "0";
    frequencyCard.occurrences.show = false;
    frequencyCard.estimatedEdnDateShow = false;
    api.setState("frequencyCard", frequencyCard);
    api.setState("cloneFrequencySummaryValue", text.None);
    api.setState("lockSettingsSummaryValue", text.No);
    api.setState("lockSettings", false);
    api.setState("showLockSettings", cloneProfile ? true : false);
    api.setState("showCloneRequestFormError", false);
    api.setState("cloneRequestFormError", "");
    api.setState("sourceInstanceAuthenticationErrorMessage", "");
    api.setState("onDemandBackupEstimationMessage", text.OnDemandBackupMessage);

    var _amountOfDataCopied90Days = (cloneProfileData.amount_of_data_copied_from_large_tables == "last_90_days");
    api.setState('highlightText', "Selecting 'Last 90 days' can increase clone time.");
    api.setState('highlightTextShow', _amountOfDataCopied90Days ? true : false);
    api.setState("amountOfDataCopiedFromLargeTablesSummaryLabel", _amountOfDataCopied90Days ? text.Last_90_days : text.Full);

    api.setState("onDemandBackupSummaryValue", api.state.on_demand_backup ? text.Yes : text.No);
    api.setState("excludeTablesSpecifiedInExclusionListSummaryValue", String(cloneProfileData.exclude_all_from_exclusion_list) === "true" ? text.Yes : text.No);
    api.setState("excludeAuditAndLogDataSummaryValue", String(cloneProfileData.exclude_large_data) === "true" ? text.Yes : text.No);
    api.setState("excludeAttachmentDataSummaryValue", String(cloneProfileData.filter_attachment_data) === "true" ? text.Yes : text.No);
    api.setState('preserverThemeSummaryValue', String(cloneProfileData.preserve_theme) === "true" ? text.Yes : text.No);
    api.setState("preserveInProgressGlobalUpdateSetsSummaryValue", cloneProfileData.preserve_in_progress_update_sets == "last_90_days" ? text.Last_90_days : text.None);

    if (cloneProfileData.target_instance) {
        var _targetInstance = targetInstances.find((el) => {
            return el.id == cloneProfileData.target_instance;
        });
        if (_targetInstance) {
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
    } else {
        api.setState('disableCloneScheduleStartTime', true);
    }

    if (currentUser && currentUser.label) {
        selectedUsers.push(currentUser);
        api.setState("internalEmails", currentUser.label);
        api.setState("emailUponCompletionSummaryValue", currentUser.label);
    }
    api.setState("selectedUsers", selectedUsers);
}
