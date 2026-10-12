
      
      /**
       * @param {params} params
       * @param {api} params.api
       * @param {any} params.event
       * @param {any} params.imports
       */
      function handler({
          api,
          event,
          imports,
          helpers
      }) {
          var item = event.payload.notificationItem;
          var itemId = event.payload.notificationItem.id;
          api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
              items: [
                  item
              ],
          });
          helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
              items: [{
                  id: itemId
              }]
          }), 5000);
      }
