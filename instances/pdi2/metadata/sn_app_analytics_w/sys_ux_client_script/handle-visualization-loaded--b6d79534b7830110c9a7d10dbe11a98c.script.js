
            /**
    * @param {params} params
    * @param {api} params.api
    * @param {any} params.event
    * @param {any} params.imports
    * @param {ApiHelpers} params.helpers
    */
    function handler({api, event, helpers, imports}) {
        
        const options = {
            icon: event.payload.icon, 
            title: event.payload.title
        };
        //console.log("VizDesigner loaded: emit SCREEN_STATUS_CHANGED", options);
        api.emit('SCREEN_STATUS_CHANGED', options);
    }
