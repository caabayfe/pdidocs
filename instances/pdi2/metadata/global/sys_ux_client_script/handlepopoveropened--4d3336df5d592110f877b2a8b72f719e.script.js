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
       const {
           payload
       } = event;
       let calendarEvent = JSON.parse(JSON.stringify(payload.event));
       let popoverTemplate = {
           popoverState: {
               value: 'ready',
               id: calendarEvent.id,
               timestamp: payload.timestamp
           },
           event: {
               ...calendarEvent,
           },
           popoverShowEditButton: true,
       };
       api.setState('popoverTemplate', popoverTemplate);
   }
