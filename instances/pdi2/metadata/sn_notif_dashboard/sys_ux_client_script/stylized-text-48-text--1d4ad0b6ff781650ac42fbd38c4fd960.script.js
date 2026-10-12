/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
      var notificationPreferenceOptOutCount =  api.state.mostOptedOutNotificationJSON.notificationPreferenceOptOutCount;
      var notificationTotalPreferenceCount =  api.state.mostOptedOutNotificationJSON.notificationTotalPreferenceCount;
      var optOutCount = notificationPreferenceOptOutCount ? notificationPreferenceOptOutCount : 0;
      var totalCount = notificationTotalPreferenceCount ? notificationTotalPreferenceCount : 0;
      return optOutCount + "/" + totalCount;
}
