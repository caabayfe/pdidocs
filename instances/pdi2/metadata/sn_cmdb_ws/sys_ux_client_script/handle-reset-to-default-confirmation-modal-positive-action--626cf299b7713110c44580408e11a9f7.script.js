/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { DM_PROPERTY_NAMES} = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const {
        agingTaskTimeFrame: canEditAgingTaskTimeFrame,
        subflowRunTime: canEditSubflowRunTime,
        defaultArchiveTime: canEditDefaultArchiveTime,
        staleTask: canEditStaleTask,
        rejectTaskNotificationsGroup: canEditRejectTaskNotificationsGroup,
        notificationSettings: canEditNotificationSettings,
        runAsUserDefault: canEditRunAsUserDefault,
        runAsUserGroup: canEditRunAsUserGroup
    } = api.state.canEdit;
    let inputPropertiesArr = [];
    if (canEditAgingTaskTimeFrame) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME); 
    if (canEditSubflowRunTime) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_SUBFLOW_TIMEOUT);
    if (canEditDefaultArchiveTime) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS);
    if (canEditStaleTask) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_STALE_TASK_LIFE_IN_DAYS);
    if (canEditRejectTaskNotificationsGroup) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP);
    if (canEditNotificationSettings) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_NOTIFICATION_SETTINGS);
    if (canEditRunAsUserDefault) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_DEFAULT_RUN_AS_USER);
    if (canEditRunAsUserGroup) inputPropertiesArr.push(DM_PROPERTY_NAMES.PROP_NAME_RUN_AS_USER_GROUP);

    api.data.data_manager_reset_to_default_properties.execute({properties: inputPropertiesArr});
}
