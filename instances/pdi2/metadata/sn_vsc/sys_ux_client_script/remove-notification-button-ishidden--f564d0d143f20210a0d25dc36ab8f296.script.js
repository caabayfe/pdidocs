/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If its a new notification added from notification dropdown, the remove button should be enabled
  if (api.item.value.new_notification) {
    return false;
  }
  // Had this been an existing notification, it will tell us if its an OOB notification/ Custom notification
  const isCustomNotification = api?.item?.value?.isCustomNotification;
  return isCustomNotification ? false : true;
}
