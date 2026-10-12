/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
   const { parseErrorFromEvent} = imports["sn_cmdb_ws.CMDBWsErrorUtil"]();
   const {
        ERROR_NOTIFICATION_PROPS,
        showNotification
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();

   const errorObj = await parseErrorFromEvent({ event, helpers});
   var errorDetails = errorObj.DETAILS;

   api.setState("ireError", errorObj);
   var content = { "type": "html", "value": errorDetails.trim()};
   var action = { "type": "dismiss" };
   var id = 'errorId1' + new Date().valueOf();
   var status = "critical";
   var icon = "exclamation-triangle-outline";
   api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                      items: [{
                                       id,
                                       status,
                                       icon,
                                       content,
                                       action
                                   }]
                    });

   let {
        navButtonState,
        prevUserPayload
    } = api.state;
    navButtonState['continue']['disabled'] = true;
    api.setState('navButtonState', navButtonState);
    if (prevUserPayload) {
        api.setState('userPayload', prevUserPayload);
        api.setState('prevUserPayload', '');
    }

   showNotification({ api, helpers }, notifications);
   console.error("Code: " + errorObj.CODE + " Source if defined: " + errorObj.SOURCE + " Details: " + errorObj.DETAILS);
}
