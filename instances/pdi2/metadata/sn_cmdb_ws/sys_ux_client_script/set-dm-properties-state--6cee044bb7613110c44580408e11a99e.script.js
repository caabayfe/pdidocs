function script({api, event}) { 
     // Set State values using data 
    const output = api.data.getDMProperties.output;

    api.setState('agingTaskTimeFramePropValue', output.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME.value);
    api.setState('subflowRuntTimePropValue', output.PROP_NAME_SUBFLOW_TIMEOUT.value);
    api.setState('defaultArchiveTimePropValue', output.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS.value);
    api.setState('staleTaskPropValue', output.PROP_NAME_STALE_TASK_LIFE_IN_DAYS.value);
    api.setState('searchPrefix', output.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP.value);
    api.setState('notificationAttestationPropValue', output.PROP_NAME_NOTIFICATION_SETTINGS.ATTESTATION.value);
    api.setState('notificationCertificationPropValue', output.PROP_NAME_NOTIFICATION_SETTINGS.CERTIFICATION.value);
    api.setState('runAsUserDefaultPropValue', output.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER.value);
    api.setState('runAsUserGroupPropValue', output.PROP_NAME_SCHEDULED_JOB_USER_GROUP.value);

    api.setState('canEdit', {
       agingTaskTimeFrame: output.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME.canEdit,
       subflowRunTime: output.PROP_NAME_SUBFLOW_TIMEOUT.canEdit,
       defaultArchiveTime: output.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS.canEdit,
       staleTask: output.PROP_NAME_STALE_TASK_LIFE_IN_DAYS.canEdit,
       rejectTaskNotificationsGroup: output.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP.canEdit,
       notificationSettings: output.PROP_NAME_NOTIFICATION_SETTINGS.canEdit,
       runAsUserDefault: output.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER.canEdit,
       runAsUserGroup: output.PROP_NAME_SCHEDULED_JOB_USER_GROUP.canEdit
    });
 }
