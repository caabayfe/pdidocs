(function() {
    data.CONST = {
        i18n: {
            BUTTON: {
                CANCEL: gs.getMessage("Cancel"),
                DELETE: gs.getMessage("Delete"),
                SUBMIT: gs.getMessage("Save")
            },
            DELEGATE: gs.getMessage("Delegate"),
            DELEGATE_COUNT: gs.getMessage("Delegate ({})"),
            DELEGATE_SINGLE_TASK: gs.getMessage("Delegate this task"),
            MODAL_TITLE: gs.getMessage("Select the person to do this task for you"),
            VIEW_PROFILE: gs.getMessage("View {} profile"),
            VIEW_ALL: gs.getMessage("View all"),
            BUTTON_TITLE: {
                ADD: gs.getMessage("Add delegate for this task"),
                EDIT: gs.getMessage("Edit delegate"),
                VIEW_ALL: gs.getMessage("View all delegates for this task")
            }
        }
    };
    data.sysId = input && input.sysId ? input.sysId : options.sysId;
    data.userId = gs.getUserID();
    data.tableName = input && input.tableName ? input.tableName : options.tableName;
    data.primaryInfo = (input && input.primaryInfo) || options;
    data.isCompleted = input && input.isCompleted ? input.isCompleted : options.isCompleted;
    data.future = input && input.future ? input.future : options.future;
    data.transport = input && input.transport ? input.transport : options.transport;
    data.isGranularDelegationActive = GlidePluginManager().isActive('com.glide.granular_service_delegation');

    // only perform if granular delegation plugin is active
    if (data.isGranularDelegationActive) {
        var granularDelegateUtils = new global.Delegation();
        var record = new GlideRecord(data.tableName);
        data.canDelegateRecord = (data.sysId && record.isValid() && record.get(data.sysId)) ? granularDelegateUtils.canDelegateRecord(record) : false;
        data.active_duty_available = granularDelegateUtils.checkUserHasActiveDelegationRule();
        // if rules are available, get assigned delegates
        if (data.active_duty_available)
            data.currentDelegates = granularDelegateUtils.getSingleRecordDelegate(data.sysId, data.tableName);
        if (data.transport) {
            if (data.transport.action === "createOrEditSingleRecordDelegate")
                granularDelegateUtils.createOrEditSingleRecordDelegate(
                    data.sysId,
                    data.tableName,
                    data.transport.delegates
                );
            else if (data.transport.action === "deleteSingleRecordDelegate")
                granularDelegateUtils.deleteSingleRecordDelegate(
                    data.sysId,
                    data.transport.delegation_record_id
                );
            return;
        }
    }

    if (data.primaryInfo.widget && data.primaryInfo.widgetName) {
        data.primaryInfoWidget = $sp.getWidget(data.primaryInfo.widgetName, data.primaryInfo.widgetParams);
    }
})();
