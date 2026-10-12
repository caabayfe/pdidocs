/**
 * Update Dialog - the purpose of this script is to update the specific dialog based on the ID passed in the payload.
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    //destructure the params
    const {payload = {}} = event;

    api.setState('modelessList', ({currentValue: modelessList}) =>{
        let localId = null;
        const updatedDialogs = modelessList.map((dialog) =>{
            // Check if the dialog id matches the id in the payload
            // and update it with new payload
            if(dialog.instanceId === payload.instanceId && !dialog.closed){
                localId = dialog.instanceId;
                /**
                * The default value of isDirty is null for UXF#UPDATE_DIALOG.
                * This ensures that we do not overwrite the value if
                * it already exists.
                */
                if (payload?.isDirty === null) {
                        return {...dialog, ...payload, isDirty: dialog.isDirty};
                }
                return {...dialog, ...payload};
            }
            return dialog;
        });

        // Check if the modeless dialog controller
        // has any dirty dialogs
        const hasDirtyDialog = updatedDialogs.some(dialog => dialog.isDirty);

        if(localId){
            // dispatch the new state
            // Note: The `uxfInternalIsModelessDialog` property is not part of the default `SCREEN_STATUS_CHANGED` action payload.
            // It is intended solely for internal use by the Dirty State Management system.
            // Do **not** modify or use this property without consulting the Dirty State Management team.
            api.emit('SCREEN_STATUS_CHANGED', {isDirty: hasDirtyDialog, uxfInternalIsModelessDialog: true});

            // Check if window manager modeless dialog is enabled and dispatch update to window manager
            if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled) {
                const { screenKey, experienceId, modelessWindowList} = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO;
                const modelessWindowKey = `${experienceId}-${screenKey}-${localId}`;
                const componentId = modelessWindowList?.[modelessWindowKey]?.key;
                const wmUpdatePayload = {
                    ...payload,
                    componentId,
                    instanceId: localId,
                    screenKey,
                    experienceId
                };
                
                // Add parentScreenKey if it exists
                if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.parentScreenKey) {
                    wmUpdatePayload.parentScreenKey = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO.parentScreenKey;
                }
                api.emit('UXF#UPDATE_MODELESS_WINDOW', wmUpdatePayload);
            }
        }
        return updatedDialogs;
    });
}
