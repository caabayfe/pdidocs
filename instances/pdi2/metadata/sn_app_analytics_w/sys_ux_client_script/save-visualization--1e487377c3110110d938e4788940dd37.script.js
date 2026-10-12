
            /**
    * @param {params} params
    * @param {api} params.api
    * @param {any} params.event
    * @param {any} params.imports
    * @param {ApiHelpers} params.helpers
    */
    function handler({api, event, helpers, imports}) {
        const isSaveAndClose = event.payload && event.payload.isSaveAndClose;
        if (isSaveAndClose) {
            api.emit('SCREEN_STATUS_CHANGED', {status: 'closed'});
            return;
        }
        
        const sysId = (event.payload && event.payload.sysId) || 'new' + Date.now();
        const isFromDuplicate = event.payload && event.payload.isFromDuplicate;
        const title = event.payload && event.payload.title;
        
        if (isFromDuplicate) {
            // Open a new tab
            api.emit('NAV_ITEM_SELECTED', {
                route: 'visualization-designer',
                title: title || 'Visualization Designer',
                fields: {
                    sysid: sysId
                }
            });
            return;
        }

        const options = {
            screenParams: {
                sysid: sysId
            },
            isDirty: false
        };
        if (title)
            options.title = title;
    
        api.emit('SCREEN_STATUS_CHANGED', options);
    }
