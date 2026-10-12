/**
 * Dirty Dialog - the purpose of this script is to update the dirty state of the specific dialog based on the ID passed in the payload.
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function script({ api, event }) {
    const instanceId = event.payload.instanceId;

    const uxfModelessDialogs = [...api.state.modelessList];
    let hasDirtyDialog = false;
    let localId = null;
    let isCurrentDirty = false;
    const updatedDialogs = uxfModelessDialogs.map((dialog) => {
        //check if the dialog id matches the id in the payload
        if (Object.keys(dialog).length > 0 && dialog.instanceId === instanceId && !(dialog.closed && dialog.confirmed)) {
            localId = dialog.instanceId;
            dialog.isDirty = event.payload.isDirty ?? !dialog.isDirty;
            isCurrentDirty = dialog.isDirty;
        }
        if (Object.keys(dialog).length > 0 && dialog.isDirty) {
            hasDirtyDialog = true;
        }
        return dialog;
    });
    api.setState('modelessList', updatedDialogs);
    //Dispatch an event letting page author know that modeless dialogs are dirty or not
    // Note: The `uxfInternalIsModelessDialog` property is not part of the default `SCREEN_STATUS_CHANGED` action payload.
    // It is intended solely for internal use by the Dirty State Management system.
    // Do **not** modify or use this property without consulting the Dirty State Management team.
    api.emit('SCREEN_STATUS_CHANGED', { isDirty: hasDirtyDialog, uxfInternalIsModelessDialog: true });

    if (localId) {
        // Check if window manager modeless dialog is enabled and dispatch dirty to window manager
        if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled) {
            const { screenKey, experienceId, modelessWindowList } = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO;
            const modelessWindowKey = `${experienceId}-${screenKey}-${localId}`;
            const componentId = modelessWindowList?.[modelessWindowKey]?.key;
            const wmDirtyPayload = {
                componentId,
                instanceId: localId,
                screenKey,
                experienceId,
                isDirty: isCurrentDirty
            };

            // Add parentScreenKey if it exists
            if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.parentScreenKey) {
                wmDirtyPayload.parentScreenKey = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO.parentScreenKey;
            }
            api.emit('UXF#DIRTY_MODELESS_WINDOW', wmDirtyPayload);
        }
    }
}
