/**
* Minimize - the purpose of this script is to minimize/hide the specific dialog based on the ID passed in the payload
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {payload = {}} = event;
    const {instanceId, minimizedMandate=false} = payload;
    let localId = null;
    let localCompositionId = null;
    const updateDialogs = api.state.modelessList.map((dialog) => {
        if ((Object.keys(dialog).length > 0 && (dialog.instanceId === instanceId ) && !dialog.closed)) {
            localId = dialog.instanceId;
            localCompositionId = dialog.compositionId;
            return {...dialog, opened: false};
        }
        return dialog;
    });
    if(localId){
        //dispatch the new state
        api.setState('modelessList', updateDialogs);
        api.emit('UXF#DIALOG_HIDDEN', {instanceId: localId, compositionId: localCompositionId});

        if(!minimizedMandate){
            // Check if window manager modeless dialog is enabled and dispatch minimize to window manager
            if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled) {
                const { screenKey, experienceId, modelessWindowList} = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO;
                const modelessWindowKey = `${experienceId}-${screenKey}-${localId}`;
                const componentId = modelessWindowList?.[modelessWindowKey]?.key;
                const wmHidePayload = {
                    componentId,
                    instanceId: localId,
                    screenKey,
                    experienceId
                };

                // Add parentScreenKey if it exists
                if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.parentScreenKey) {
                    wmHidePayload.parentScreenKey = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO.parentScreenKey;
                }
                api.emit('UXF#MINIMIZE_MODELESS_WINDOW', wmHidePayload);
            }
        }
        
    }
}
