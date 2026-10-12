/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const alertNotification = event.payload.notificationObj ? event.payload.notificationObj: {};
    api.emit("PWD_RESET_UIB#SHOW_ALERT_FROM_VERIFY", {
        notificationObj: alertNotification
    });
}
