/**
    * @param {params} params
    * @param {api} params.api
    * @param {any} params.event
    * @param {any} params.imports
    */
   function handler({api, event, helpers, imports}) {
       api.setState('popoverTemplate', {
           "popoverState": {
               value: "destroyed"
           },
           "event": {
               "title": "",
               "start": "",
               "end": "",
               "showAs": "",
               "repeats": ""
           },
           "popoverShowEditButton": false
       });
   }
