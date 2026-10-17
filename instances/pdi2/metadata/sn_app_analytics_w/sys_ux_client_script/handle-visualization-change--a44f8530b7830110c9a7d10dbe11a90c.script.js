
            /**
    * @param {params} params
    * @param {api} params.api
    * @param {any} params.event
    * @param {any} params.imports
    * @param {ApiHelpers} params.helpers
    */
    function handler({api, event, helpers, imports}) {
        
        const options = {
            isDirty: event.payload && event.payload.hasChanges
        };
        if (event.payload && event.payload.title) {
            options.title = event.payload.title;
        }
        if (event.payload && event.payload.icon) {
            options.icon = event.payload.icon;
        }
        
        //console.log("VizDesigner changed: emit SCREEN_STATUS_CHANGED", options);
        api.emit('SCREEN_STATUS_CHANGED', options);
    }
