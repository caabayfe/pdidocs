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
    let existingNotifications = api?.data?.get_existing_notifications_of_a_policy?.output?.notifications_for_ui;
    let allEligibleNotifications = api?.data?.get_eligible_notifications_for_the_security_policy?.output?.notifications.data;
    let newNotificationsForUI = [];
    if (!existingNotifications && !allEligibleNotifications) {
        return;
    } else if (existingNotifications || allEligibleNotifications) {
        if (!existingNotifications.length) {
            // If no notification has been associated so far to a policy
            newNotificationsForUI = allEligibleNotifications;
        } else {
            // If some elgible notification is not yet attached with the policy
            for (var i = 0; i < (allEligibleNotifications?.length || 0); i++) {
                var eligibleNotification = allEligibleNotifications[i];
                var eligibleNotificationModelId = eligibleNotification.model_id;
                var hasFoundAMatch = false;
                var finalDataObj = {};
                var uiData;
                for (var j = 0; j < existingNotifications.length; j++) {
                    var existingNotification = existingNotifications[j];
                    var existingNotificationModelId = existingNotification.model_id;
                    if (existingNotificationModelId == eligibleNotificationModelId) {
                        // Push it to the UI
                        hasFoundAMatch = true;
                        uiData = existingNotification;
                        uiData["displayOff"] = false;
                        newNotificationsForUI.push(uiData);
                    }
                }
                if (!hasFoundAMatch) {
                    uiData = eligibleNotification;
                    uiData["displayOff"] = true;
                    newNotificationsForUI.push(uiData);
                }
            }
        }
        api.setState("notificationsOnTheUI", newNotificationsForUI);

        // Prepare the notification modal dropdown
        let newNotificationsForModalDropDown = [];
        for (const notification of allEligibleNotifications) {
            newNotificationsForModalDropDown.push(notification)
        }
        api.setState("notificationsForModalDropDown", newNotificationsForModalDropDown);
    }
}
