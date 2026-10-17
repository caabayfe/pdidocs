/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  const { PAGE_ROUTES, DM_PROPERTY_NAMES} = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
  if (event.payload.id === "add_definition_button") {
      helpers.navigate.to(PAGE_ROUTES.RETIREMENT_DEFINITION, { sysId: '-1' }, null, null, null, "current");
  } else if (event.payload.id === 'update_properties_button') {
      const isSettingsPageDirty = api.state.isSettingsPageDirty; 
      if (!isSettingsPageDirty) {
        return;
      }

      const agingTaskTimeFramePropValue = api.state.agingTaskTimeFramePropValue;
      const subflowRuntTimePropValue = api.state.subflowRuntTimePropValue;
      const defaultArchiveTimePropValue = api.state.defaultArchiveTimePropValue;
      const staleTaskPropValue = api.state.staleTaskPropValue;
      const rejectTaskNotificationsPropValue = api.state.rejectTaskNotificationsPropValue;
      const notificationAttestationPropValue = api.state.notificationAttestationPropValue;
      const notificationCertificationPropValue = api.state.notificationCertificationPropValue;
      const runAsUserDefaultPropValue = api.state.runAsUserDefaultPropValue;
      const runAsUserGroupPropValue = api.state.runAsUserGroupPropValue;
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

      let inputProperties = {};
      if (canEditAgingTaskTimeFrame)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME] = agingTaskTimeFramePropValue;
      if (canEditSubflowRunTime)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_SUBFLOW_TIMEOUT] = subflowRuntTimePropValue;
      if (canEditDefaultArchiveTime)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS] = defaultArchiveTimePropValue;
      if (canEditStaleTask)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_STALE_TASK_LIFE_IN_DAYS] = staleTaskPropValue;
     if (canEditRejectTaskNotificationsGroup)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP] = rejectTaskNotificationsPropValue;
      if (canEditNotificationSettings) {
          let notificationProps = {};
          notificationProps["attestation"] = notificationAttestationPropValue;
          notificationProps["certification"] = notificationCertificationPropValue;
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_NOTIFICATION_SETTINGS] = notificationProps;
      }
      if (canEditRunAsUserDefault)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_DEFAULT_RUN_AS_USER] = runAsUserDefaultPropValue;
      if (canEditRunAsUserGroup)
          inputProperties[DM_PROPERTY_NAMES.PROP_NAME_RUN_AS_USER_GROUP] = runAsUserGroupPropValue;

      api.data.data_manager_update_properties.execute({properties: inputProperties});
  }
}
