/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { chat_setup } = api.state;
    const { elementId : cloumnName, payload : {value : newValue} } = event;
    
    if (chat_setup[cloumnName]) {
        const updatedSetup = {
                ...chat_setup,
                [cloumnName]: {
                    ...chat_setup[cloumnName],
                    value : newValue
                },
            };
        
        api.setState('chat_setup', updatedSetup);

        const { settings } = api.data;
        const dbValue = settings.output.chat_setup[cloumnName]['value'];
        if ( newValue != dbValue) {
            api.emit('SCREEN_STATUS_CHANGED', { isDirty : true });
        } else {
            api.emit('SCREEN_STATUS_CHANGED', { isDirty : false });
        }
    }
}
