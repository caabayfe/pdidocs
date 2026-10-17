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
    const notificationObj = event?.context?.item?.value;
    const index = event?.context?.item?.index;
    let notificationsOnTheUI = api?.state?.notificationsOnTheUI || [];
    let newNotificationsOnTheUI = [];
    let removedNotifications = api?.state?.removedNotifications;
    let removedNotificationsModelId = removedNotifications ? JSON.parse(JSON.stringify(removedNotifications)) : [];
    let hasTheNotificationRemoved = false;
    if (notificationObj && notificationsOnTheUI.length) {
        for (let currentIndex = 0; currentIndex < notificationsOnTheUI.length; currentIndex++) {
            var notification = notificationsOnTheUI[currentIndex];
            /**
             * 1. If an existing notification is removed from the UI, it will have its own 'policy_action_sysId'
             * 2. If the user just added and removed, it won't have any `policy_action_sysId` so far as it never was saved earlier
             * 3. 'hasTheNotificationRemoved' will let us decide if we already have removed the notification, no need to continue
             */
            if (!hasTheNotificationRemoved && currentIndex == index) {
                // Remove the notification from the UI and update the removed notifications array with its 'policy_action_sysId'
                if (notification["policy_action_sysId"]) {
                    removedNotificationsModelId.push(notification["policy_action_sysId"]);
                }

                // Clear the pre-selected values of the notification once removed from the UI
                var deepDataClone = JSON.parse(JSON.stringify(notification["data"])) || [];
                for (var j = 0; j < deepDataClone.length; j++) {
                    deepDataClone[j]["new_notification"] = true;
                    deepDataClone[j]["policy_action_sysId"] = null;
                    deepDataClone[j]["selected_value"] = [];
                }
                notification["data"] = deepDataClone;
                if (!notification["displayOff"]) {
                    notification["policy_action_sysId"] = null;
                    notification["new_notification"] = true;
                    notification["displayOff"] = true;
                    hasTheNotificationRemoved = true;
                }
            }
            /**
             *  1. Keep pushing the 'notification' object into new array, so we can reset state to trigger re-render
             *  2. This is required to trigger re-render
             *  */
            newNotificationsOnTheUI.push(notification);
        }
    }


    let modelID = notificationObj?.model_id;
    if (modelID && index != null && index != undefined) {
        let glideVariables = api?.state?.glideVariablesValue;
        let idIndex = modelID + '_' + index;
        delete glideVariables[idIndex];
        api.setState("glideVariablesValue", glideVariables);
    }

    /**
     *  1. Add the newly removed notifications in the array for the payload
     *  2. For the notifications which were never saved yet, will not have any `policy_action_sysId`
     * 
     */
    api.setState("removedNotifications", removedNotificationsModelId);
    api.setState("notificationsOnTheUI", newNotificationsOnTheUI);
}
