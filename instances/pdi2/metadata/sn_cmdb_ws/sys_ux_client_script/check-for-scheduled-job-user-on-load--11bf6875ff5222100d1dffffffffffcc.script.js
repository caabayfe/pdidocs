async function handler({ api, event, helpers, imports }) {
  const { WARNING_NOTIFICATION_PROPS, showNotificationWithAutoClose } =
    imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
  var shouldWarnMissingUser = api.data.policyFormController.policyData.schedule.run_user == '';
    let message =  await helpers.translate("No scheduled job user found for this policy,  please select a user account to run the associated scheduled job in the scheduling tab");

  const notificationId = "warningId" + new Date().valueOf();
  let notifications = [
    {
      ...WARNING_NOTIFICATION_PROPS,
      id: notificationId,
      content: message,
    },
  ];
  if(shouldWarnMissingUser)
  showNotificationWithAutoClose({ api, helpers }, notifications);
}
