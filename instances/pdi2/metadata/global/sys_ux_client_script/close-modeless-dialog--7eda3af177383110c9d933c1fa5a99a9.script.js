/**
 * Close Dialog - the purpose of this script is to close the specific dialog based on the ID passed in the payload.
 * this is a destructive action and will remove the dialog from the state. There is no recovery from this.
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	api.setState('modelessList', ({currentValue: modelessList}) => {
		const {payload = {}, eventInfo} = event;
		const {instanceId: payloadId, closeMandate, closeConfirm = false} = payload;
		const {sourceElementId: sourceId} = eventInfo
		const uxfModelessDialogs = [...modelessList];
		let match = {};
		let matchIdx = null;
		let hasOtherDirtyDialogs = false;
		let localId = null;
		let localCompositionId = null;

		// Find the dialog matching this ID
		uxfModelessDialogs.forEach((dialog, i) => {
			if (Object.keys(dialog).length > 0 && dialog.instanceId === payloadId) {
				match = dialog;
				matchIdx = i;
				localId = dialog.instanceId;
				localCompositionId = dialog.compositionId;
			} else {
				if (dialog.isDirty) {
					hasOtherDirtyDialogs = true;
				}
			}
		});

		// Taking this part out of below !isDirty conditional since it needs to happen for Dirty case too
		if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled && localId){
			// When WM is present defer all close mechanisms to WM
			const { screenKey, experienceId, modelessWindowList } = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO;
			const modelessWindowKey = `${experienceId}-${screenKey}-${localId}`;
			const componentId = modelessWindowList?.[modelessWindowKey]?.key;
			const wmClosePayload = {
				componentId,
				instanceId: localId,
				screenKey,
				experienceId,
				forceDestroy: closeMandate || false,
				uxfMeta: event.meta?.uxfMeta || {}, // adding meta here because emit doesn't take 3rd parameter
			};

			// Add parentScreenKey if it exists
			if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.parentScreenKey) {
				wmClosePayload.parentScreenKey = event.meta.uxfMeta.UXF_WINDOW_MANAGER_SCREEN_INFO.parentScreenKey;
			}
			api.emit('UXF#CLOSE_MODELESS_WINDOW', wmClosePayload);
		}

		if(!match.isDirty || closeMandate){
			if(localId){
				//Original close logic should be done for both cases, WM and non-WM(original), except splice which will be handled later in sn-canvas-main handler
				//Proceed with close and update the state
				if (closeConfirm) {
				    uxfModelessDialogs[matchIdx] = {
				        instanceId: localId,
				        closed: true,
				        confirmed: true
				    };
				} else if (!event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled) {
				    uxfModelessDialogs.splice(matchIdx, 1);
				}
				api.emit('UXF#DIALOG_CLOSED', {instanceId: localId, compositionId: localCompositionId, hasOtherDirtyDialogs: hasOtherDirtyDialogs});
				// Note: The `uxfInternalIsModelessDialog` property is not part of the default `SCREEN_STATUS_CHANGED` action payload.
				// It is intended solely for internal use by the Dirty State Management system.
				// Do **not** modify or use this property without consulting the Dirty State Management team.
				api.emit('SCREEN_STATUS_CHANGED', {isDirty: hasOtherDirtyDialogs, uxfInternalIsModelessDialog: true});
			}
		} else if (!event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled) {
			api.emit('UXF#DIALOG_CLOSE_REQUESTED', {instanceId: localId, compositionId: localCompositionId, sourceElementId: sourceId});
		}
		return uxfModelessDialogs;
	})
}
