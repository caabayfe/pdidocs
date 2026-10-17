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
    let selectedNotificationFromModal = api?.state?.selectedNotificationFromModal;
    let newNotificationsOnTheUI = api?.state?.notificationsOnTheUI;
    let notificationsForModalDropDown = api?.state?.notificationsForModalDropDown;
    if (!selectedNotificationFromModal || !newNotificationsOnTheUI || !notificationsForModalDropDown) {
        return;
    }
    let newNotificationsForModalDropDown = [];
    let repeatedNotifications = {};
    if (newNotificationsOnTheUI.length) {
        for (var i = 0; i < newNotificationsOnTheUI.length; i++) {
            var notification = newNotificationsOnTheUI[i];
            // 'model_id' id will be used to grab the record we would like to throw on the UI to render
            if (notification["model_id"] == selectedNotificationFromModal) {
                // If on the UI the notification was visible already, we need to still let it get pushed into 'newNotificationsOnTheUI' array for re-render
                if (notification["displayOff"] == true) {
                    notification["displayOff"] = false;
                    newNotificationsOnTheUI[i] = notification;
                } else {
                    // Create a new object entry for the newly added notification
                    var new_notification = JSON.parse(JSON.stringify(notification))
                    new_notification["policy_action_sysId"] = null;
                    // The 'new_notification' flag needs to be passed in so we can decide to add this as a new notification which could of same type
                    new_notification["new_notification"] = true;
                    var deepDataClone = JSON.parse(JSON.stringify(new_notification["data"]))
                    for(var j=0;j<deepDataClone.length;j++) {
                        deepDataClone[j]["new_notification"] = true;
                        deepDataClone[j]["policy_action_sysId"] = null;
                        deepDataClone[j]["selected_value"] = [];
                        // While trying to add new notification, we must create this node's element id, for payload creation
                        deepDataClone[j]["currentElementId"] = generateRandomIdentifier();
                    }
                    new_notification["data"] = deepDataClone;
                    repeatedNotifications = new_notification;
                }
                // Once found break out, no need to continue
                break;
            }
        }
    }
    // Had there been a notification added from the notification dropdown, it should update the UI
    if (Object.keys(repeatedNotifications).length) {
        newNotificationsOnTheUI.push(repeatedNotifications);
    }
    api.setState("modalNotificationSelectedState", []);
    api.setState("notificationsOnTheUI", newNotificationsOnTheUI);

    // Generates a unique identifier to distinguish typeahead components
    function generateRandomIdentifier() {
        const dt = new Date();
        return (dt + Math.random().toString(36).slice(2, 7)); 
    }
}
