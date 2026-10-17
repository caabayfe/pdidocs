function include({imports}) {
      const ERROR_NOTIFICATION_PROPS = {
            "status": "critical",
            "icon": "circle-close-outline",
            "action": {
                "type": "dismiss"
           }
    };

   const SUCCESS_NOTIFICATION_PROPS = {
            "status": "positive",
            "icon": "circle-info-outline",
            "action": {
                "type": "dismiss"
            }
       };

    var _handleRemoveNotifications = function(emit, notificationId, helpers) {
         const timeoutId = helpers.timing.setTimeout(() => {
         emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
          items: [{id: notificationId}]
          }); }, 5000);
    }

     var _emitErrorNotification = async function(notificationId, errorMessage, emit, helpers) {
         const notifications = [];
 
         if(!errorMessage) {
              errorMessage = "invalid error";
         }
         notifications.push({
             ...ERROR_NOTIFICATION_PROPS,
              "content": await helpers.translate("{0}", errorMessage),
              "id": notificationId 
        });
        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
       _handleRemoveNotifications(emit,notificationId,helpers);
   }

   var _emitSuccessNotification = async function(notificationId, successMessage, emit, helpers) {
         const notifications = [];
 
         notifications.push({
             ...SUCCESS_NOTIFICATION_PROPS,
              "content": await helpers.translate("{0}", successMessage),
              "id": notificationId 
        });
        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
       _handleRemoveNotifications(emit,notificationId,helpers);
   }

    return {
        ERROR_NOTIFICATION_PROPS,
        SUCCESS_NOTIFICATION_PROPS,
        emitErrorNotification : _emitErrorNotification,
        emitSuccessNotification : _emitSuccessNotification,
        handleRemoveNotifications: _handleRemoveNotifications
   };
 }
