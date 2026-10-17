function include({imports}) {
      const ERROR_NOTIFICATION_PROPS = {
            "status": "critical",
            "icon": "exclamation-triangle-fill",
            "action": {
                "type": "dismiss"
           }
    };

   const SUCCESS_NOTIFICATION_PROPS = {
            "status": "positive",
            "icon": "check-circle-outline",
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

     var _emitErrorNotification = async function(errorMessage,emit,translate,helpers) {
         const notifications = [];
         const notificationId = 'errorId' + new Date().valueOf();
 
         if(!errorMessage) {
              errorMessage = "invalid error";
         }
         notifications.push({
             ...ERROR_NOTIFICATION_PROPS,
              "content": await translate("{0}", errorMessage),
              "id": notificationId 
        });
        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
       _handleRemoveNotifications(emit,notificationId,helpers);
   }

   var _emitSuccessNotification = async function(successMessage,emit,translate,helpers) {
         const notifications = [];
         const notificationId = 'successId' + new Date().valueOf();
 
         notifications.push({
             ...SUCCESS_NOTIFICATION_PROPS,
              "content": await translate("{0}", successMessage),
              "id": notificationId 
        });
        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
       _handleRemoveNotifications(emit,notificationId,helpers);
   }

    var _handleDeleteQueryNotifications = async function(api, helpers, status,error) {
          const notifications = [];
          if(status === "failure" && error) {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "content": await helpers.translate("Error - {0}", error.message)
               });
           } 

          if(status === "success") {
            var messageContent = await helpers.translate("Query successfully deleted");
            const notificationId = 'successId' + new Date().valueOf();
            notifications.push({
                ...SUCCESS_NOTIFICATION_PROPS,
                "content": messageContent,
                "id": notificationId
            });
        }

        if (notifications.length > 0) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: notifications
            });
        }

        if (notifications.length > 0) {
            notifications.forEach(item => {
                _handleRemoveNotifications(api.emit, item.id, helpers);
            });
        }
      
    }

    return {
        ERROR_NOTIFICATION_PROPS,
        SUCCESS_NOTIFICATION_PROPS,
        emitErrorNotification : _emitErrorNotification,
        emitSuccessNotification : _emitSuccessNotification,
        handleRemoveNotifications: _handleRemoveNotifications,
        handleDeleteQueryNotifications: _handleDeleteQueryNotifications
   };
   
 }
