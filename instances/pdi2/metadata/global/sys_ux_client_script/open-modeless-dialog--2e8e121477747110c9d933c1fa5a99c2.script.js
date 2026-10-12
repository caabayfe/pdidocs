/**
 * Open/Show Dialog
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	api.setState('modelessList', ({currentValue: modelessList}) => {
		//destructure the payload from the event
		const {payload = {}} = event;
		let uxfModelessDialogs = [...modelessList];
		//define the keys for the modelessDialog object
		const modelessDialogObjKeys = {
			INSTANCE_ID: 'instanceId',
			COMPOSITION_ID: 'compositionId',
			PAYLOAD: 'payload',
			IS_DIRTY: 'isDirty',
			OPENED: 'opened',
			TITLE: 'dialogTitle',
			MINIMIZED_TITLE: 'minimizedTitle',
			CATEGORY: 'category',
			POSITION: 'position',
			META: 'meta',
			SINGLE_INSTANCE: 'singleInstance',
			HIDE_OTHERS: 'hideOthers',
			SOURCE_ELEMENT_COMPONENT_ID : 'originalSourceElement'
		}

		//when payload.hideOthers is true, hide all other dialogs in uxfModelessDialogs
		if (payload.hideOthers) {
			uxfModelessDialogs = uxfModelessDialogs.map(dialog => {
				if (dialog.opened) {
					return {...dialog, opened: false};
				}
				return dialog;
			});
		}

		//create a random number to be used for the modelessList ID this number will be used by the BUs to do operations on the modelessList
		const instanceId = () => {
			return String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '');
		}

		//do the mapping for creating a new modeless object
		const createNewModelessDialog = (payload, localMeta, uxfMeta) => {
			return {
				[modelessDialogObjKeys.INSTANCE_ID]: payload.instanceId? payload.instanceId: instanceId(),
				[modelessDialogObjKeys.COMPOSITION_ID]: payload.compositionId,
				[modelessDialogObjKeys.PAYLOAD]: payload.payload,
				[modelessDialogObjKeys.IS_DIRTY]: false,
				[modelessDialogObjKeys.OPENED]: true,
				[modelessDialogObjKeys.TITLE]: payload.dialogTitle,
				[modelessDialogObjKeys.MINIMIZED_TITLE]: payload.minimizedTitle,
				[modelessDialogObjKeys.CATEGORY]: payload.category,
				[modelessDialogObjKeys.POSITION]: payload.position ? payload.position : 'centered',
				[modelessDialogObjKeys.META]: localMeta,
				[modelessDialogObjKeys.HIDE_OTHERS]: payload.hideOthers || false,
				[modelessDialogObjKeys.SOURCE_ELEMENT_COMPONENT_ID]:uxfMeta.originalSourceElement
			};
		}

		//create a new modelessDialog object: if the payload does not have an id or if the id doesn't exist in the uxfModelessDialogs array
		const shouldCreateNewDialog = (payload, uxfModelessDialogs) => {
			//return true if the payload does not have an id
			const hasPayloadId = !!payload[modelessDialogObjKeys.INSTANCE_ID];
			if(!hasPayloadId) return true;

			//return true if the payload id does not exist in the uxfModelessDialogs array
			const hasPayloadIdInList = uxfModelessDialogs.some(dialog => {
				return dialog.instanceId === payload.instanceId && !dialog.closed;
			});
			if(!hasPayloadIdInList) return true;
		}

		if (shouldCreateNewDialog(payload, uxfModelessDialogs)) {
		    // Get existing uxfMeta from the event, preserving all existing properties
			const existingUxfMeta = event.meta?.uxfMeta ? {...event.meta.uxfMeta} : {};
			let componentId = null;

			// First, check if we have originalSourceElement in uxfMeta
			const originalSourceEl = event.meta?.uxfMeta?.originalSourceElement;
			if (originalSourceEl) {
				// If we have a direct element reference, store it
				existingUxfMeta.originalSourceElement = Array.isArray(originalSourceEl) ?
					originalSourceEl[0] : originalSourceEl;
			}else{
			const sourcePath = event.meta?.uxfMeta?.UXF_DIRTY_STATE_MANAGEMENT_SOURCE_ACTION_PATH;
			if (Array.isArray(sourcePath) && sourcePath.length > 0) {
				existingUxfMeta.originalSourceElement = sourcePath[0];
			}
			}
			const localMeta = {eventInfo: event.eventInfo, elementId: event.elementId, currentElementId: event.currentElementId};
			//create a new modelessDialog object
			const newModelessDialog = createNewModelessDialog(payload, localMeta, existingUxfMeta);
			uxfModelessDialogs.push(newModelessDialog);
			newModelessDialog[modelessDialogObjKeys.SINGLE_INSTANCE] = payload.instanceId !== null && payload.instanceId !== undefined;
			api.emit('UXF#DIALOG_OPENED', {instanceId: newModelessDialog.instanceId, compositionId: newModelessDialog.compositionId, type: "CREATED"});
		} else {//if the payload has the id then do the show logic
			let compositionId;
			uxfModelessDialogs = uxfModelessDialogs.map(dialog => {
				//check for empty object before finding the
				if (dialog.instanceId === payload.instanceId) {
					compositionId = dialog.compositionId;
					return {...dialog, opened: true};
				}
				return dialog;
			});
			const {screenKey, experienceId} = event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO || {};
			const modelessWindowKey = `${experienceId}-${screenKey}-${payload.instanceId}`;
			const componentId = event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.modelessWindowList?.[modelessWindowKey]?.key;
			api.emit('UXF#SHOW_MODELESS_WINDOW', {
				componentId: componentId,
				instanceId: payload.instanceId,
				screenKey: screenKey,
				experienceId: experienceId
			});
			api.emit('UXF#DIALOG_OPENED', {instanceId: payload.instanceId, compositionId,  type: "RESTORED"});
		}
		return uxfModelessDialogs;
	});
}
