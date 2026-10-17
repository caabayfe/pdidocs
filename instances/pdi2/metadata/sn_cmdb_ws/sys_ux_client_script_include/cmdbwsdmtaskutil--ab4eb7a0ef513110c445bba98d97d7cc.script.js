function include({
    imports
}) {
    const {
        ERROR_NOTIFICATION_PROPS,
        SUCCESS_NOTIFICATION_PROPS
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();

    const LIFECYCLE_TASK_ACTION = {
        DM_EXCLUDE_RECORDS: 'DM_EXCLUDE_RECORDS'
    };

    const TASK_PAGE_PARAMS = {
        MY_WORK: {
            REFRESH_LIST: 'refreshList',
            SHOW_NOTIFICATION: 'showNotification'
        }
    };

    const TASK_FILTERS = {
        IS_OVERDUE: "due_date<javascript:gs.beginningOfToday()",
        IS_NOT_CLOSED: "stateNOT IN3,4,7,8",
        ASSIGNED_TO_IS_EMPTY: "assigned_toISEMPTY",
        ASSIGNMENT_GROUP_IS_EMPTY: "assignment_groupISEMPTY",
        IS_ASSIGNED_TO_ME: "assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe",
        IS_ASSIGNED_TO_MY_GROUP: "assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744"
    };

    var _validateTaskRecord = function (taskRecord, api) {
        if (taskRecord) {
            const isAdminUser = taskRecord.userIsMaint || taskRecord.userIsDataManagerAdmin;
            const recordNotFound = taskRecord.invalidTask || !isAdminUser && (taskRecord.userNotAssigned && taskRecord.userNotWithinGroup && !taskRecord.userManagesAssignee);
            api.setState('recordNotFound', recordNotFound);
        } else {
            api.setState('recordNotFound', true);
        }
    }

    var _handleRemoveNotifications = function (emit, notificationId, helpers) {
        const timeoutId = helpers.timing.setTimeout(() => {
            emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
                items: [{
                    id: notificationId
                }]
            });
        }, 5000);
    }

    var _handleLifecycleTaskNotification = async function (response, api, event, helpers) {
        const {
            error,
            action,
            successCount,
            failureCount
        } = response.result;

        const notifications = [];

        if (error && error.message) {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "content": await helpers.translate("Error - {0}", error.message)
            });
        }
        if (successCount > 0) {
            let messageContent = '';
            let txtLinkProp = {};
            if (action === LIFECYCLE_TASK_ACTION.DM_EXCLUDE_RECORDS) {
                messageContent = successCount > 1 ?
                    await helpers.translate("{0} records excluded", successCount) :
                    await helpers.translate("{0} record excluded", successCount);
            }
            const notificationId = 'successId' + new Date().valueOf();
            notifications.push({
                ...SUCCESS_NOTIFICATION_PROPS,
                "content": messageContent,
                "textLinkProps": txtLinkProp,
                "id": notificationId
            });
        }
        if (failureCount > 0) {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "content": await helpers.translate("Unable to exclude {0} CIs", failureCount)
            });
        };
        if (notifications.length > 0) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: notifications
            });
        }

        if (notifications.length > 0) {
            notifications.forEach(item => {
                _handleRemoveNotifications(api.emit, item.id, helpers);
            });
        }
    }

    return {
        LIFECYCLE_TASK_ACTION,
        TASK_PAGE_PARAMS,
        TASK_FILTERS,
        validateTaskRecord: _validateTaskRecord,
        handleRemoveNotifications: _handleRemoveNotifications,
        handleLifecycleTaskNotification: _handleLifecycleTaskNotification
    }
}
