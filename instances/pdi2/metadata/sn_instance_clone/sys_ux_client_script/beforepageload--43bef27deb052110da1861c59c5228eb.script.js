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
    let blockcontext = {};
    var block = api.state.stagedContentBlocks.find((block) => block.elementId == "styleable_container_10");
    if (block) {
        blockcontext = block.props_details.cloneProfileData || {};
        blockcontext.targetInstances = block.props_details.targetInstances;
        blockcontext.sourceInstances = block.props_details.sourceInstances;
        blockcontext.defaultTargetInstances = block.props_details.targetInstances;
        blockcontext.defaultCloneProfiles = [{
            label: block.props_details.text.None,
            id: ''
        }].concat(block.props_details.cloneProfiles);
        blockcontext.cloneProfiles = blockcontext.defaultCloneProfiles;
        blockcontext.frequencyCard = block.props_details.frequencyCard;
        blockcontext.estimatedDurationInfoMessageLabel = block.props_details.estimatedDurationInfoMessage;
        blockcontext.estimatedDurationLabel = block.props_details.estimatedDurationLabel;
        blockcontext.users = block.props_details.users;
        blockcontext.currentUser = block.props_details.current_user;
        blockcontext.successModalInfoMessageLabel = block.props_details.successModalInfoMessage;
        blockcontext.authenticateTargetHeaderLabel = block.props_details.authenticateTargetHeader;
        blockcontext.today = block.props_details.today;
        blockcontext.timeZone = block.props_details.timeZone;
        blockcontext.dataCopyItems = block.props_details.dataCopyItems;
        blockcontext.updateSetItems = block.props_details.updateSetItems;
        blockcontext.errorMessage = block.props_details.errorMessage;
        blockcontext.text = block.props_details.text || {};
        blockcontext.cloneRequestId = block.props_details.cloneRequestId;
        blockcontext.backupTypeFromCloneRequest = block.props_details.backupTypeFromCloneRequest;
        blockcontext.defaultBackupTypeFromCloneRequest = blockcontext.backupTypeFromCloneProfileDefaultSelectedItem;
        blockcontext.backupTypeFromCloneRequestSelectedItemId = blockcontext.backupTypeFromCloneProfileDefaultSelectedItem;
        blockcontext.defaultBackupTypeFromCloneRequestLabel = blockcontext.backupTypeFromCloneRequest[0].label;
        blockcontext.backupTypeFromCloneRequestSelectedItemLabel = blockcontext.backupTypeFromCloneRequest[0].label;
        blockcontext.backupTypeFromCloneProfile = block.props_details.backupTypeFromCloneProfile;
        blockcontext.hasCustomPreserver = block.props_details.cloneProfileData.hasCustomPreserver || {
            isCustom: false
        };
    }
    blockcontext.selectedUsers = [];
    if (blockcontext.currentUser && blockcontext.currentUser.id) {
        blockcontext.selectedUsers.push(blockcontext.currentUser);
        blockcontext.internalEmails = blockcontext.currentUser.label;
    }
    blockcontext.sourceInstanceName = blockcontext.text.Current_instance;
    blockcontext.sourceInstanceId = "currentInstance";
    blockcontext.targetInstanceName = blockcontext.text.None;
    blockcontext.targetInstanceUrl = "";
    blockcontext.targetInstanceId = blockcontext.target_instance || "";
    var _targetInstanceDetails = blockcontext.targetInstances.find((el)=> el.id == blockcontext.targetInstanceId);
    blockcontext.emailUponCompletionSummaryValue = blockcontext.text.None;
    blockcontext.cloneProfileName = blockcontext.name || blockcontext.text.None;
    blockcontext.cloneProfile = block.props_details.preSelectedDefaultProfile;
    blockcontext.defaultCloneProfile = blockcontext.cloneProfile;
    blockcontext.defaultCloneProfileName = blockcontext.cloneProfileName
    blockcontext.estimatedStartDateTime = "";
    blockcontext.estimatedDuration = "";
    blockcontext.estimatedDurationMessage = "";
    blockcontext.disableContinuebutton = true;
    blockcontext.showEstimatedDuration = false;
    blockcontext.showEstimatedDurationSummaryInfo = true;
    blockcontext.frequencyCard.occurrences.labelText = blockcontext.frequencyCard.occurrences.label;
    blockcontext.frequencyCard.estimatedEndDateLabelText = blockcontext.frequencyCard.estimatedEndDateLabel;
    blockcontext.frequencyCard.cloneFrequency.selected = "0";
    blockcontext.cloneFrequencySummaryValue = blockcontext.text.None;
    blockcontext.lockSettingsSummaryValue = blockcontext.text.No;
    blockcontext.lockSettings = false;
    blockcontext.showLockSettings = blockcontext.cloneProfile ? true : false;
    blockcontext.showCloneRequestFormError = false;
    blockcontext.cloneRequestFormError = "";
    blockcontext.sourceInstanceAuthenticationErrorMessage = "";
    blockcontext.onDemandBackupEstimationMessage = blockcontext.text.OnDemandBackupMessage;
    blockcontext.amountOfDataCopiedFromLargeTablesSummaryLabel = blockcontext.amount_of_data_copied_from_large_tables == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.Full;
    blockcontext.onDemandBackupSummaryValue = blockcontext.on_demand_backup ? blockcontext.text.Yes : blockcontext.text.No
    blockcontext.excludeTablesSpecifiedInExclusionListSummaryValue = blockcontext.exclude_all_from_exclusion_list ? blockcontext.text.Yes : blockcontext.text.No;
    blockcontext.excludeAuditAndLogDataSummaryValue = blockcontext.exclude_large_data ? blockcontext.text.Yes : blockcontext.text.No;
    blockcontext.excludeAttachmentDataSummaryValue = blockcontext.filter_attachment_data ? blockcontext.text.Yes : blockcontext.text.No;
    blockcontext.preserverThemeSummaryValue = blockcontext.preserve_theme ? blockcontext.text.Yes : blockcontext.text.No;
    blockcontext.preserveInProgressGlobalUpdateSetsSummaryValue = blockcontext.preserve_in_progress_update_sets == "last_90_days" ? blockcontext.text.Last_90_days : blockcontext.text.None;
    blockcontext.calendarEntries = [];
    blockcontext.nextAvailableTimeSlot = {};
    blockcontext.showConflictCalendarMessage = false;
    blockcontext.disableCloneScheduleStartTime = true;
    blockcontext.showRequestForm = true;
    blockcontext.showSummaryForm = false;
    blockcontext.showSourceInstanceAuthenticationErrorMessage = false;
    blockcontext.disableComponents = false;
    blockcontext.disableActionButton = false;
    blockcontext.disableSubmitButton = false;
    blockcontext.authenticatingSourceInstance = false;
    blockcontext.highlightTextShow = false;
    blockcontext.cloneRequestIdSelectedItemLabel = "";
    blockcontext.cloneRequestIdSelectedItemId = "";
    blockcontext.cloneRequestSelectionContainerShow = false;
    blockcontext.showAddInstanceErrorMsg = false;
    blockcontext.showAddInstanceSuccessMsg = false;
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
    if (_targetInstanceDetails) {
        blockcontext.targetInstanceName = _targetInstanceDetails.label;
        blockcontext.targetInstanceUrl = _targetInstanceDetails.instanceUrl;
        api.emit('ACE_ACTION_PERFORMED', {
            "eventName": "CR#TARGET_INSTANCE_SELECTED",
            "eventPayload": {
                "value": _targetInstanceDetails.id,
                "item": {
                    "label": _targetInstanceDetails.label,
                    "instanceUrl": _targetInstanceDetails.instanceUrl,
                    "id": _targetInstanceDetails.id
                },
                "blockcontext": {...blockcontext}
            },
        });
    }
}
