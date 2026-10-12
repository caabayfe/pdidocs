/**
 * This function is being called by the now-ui json[scriptedConfigPolicy] for Attachments
 *
 * @param api - Contains the methods to controls the state of the properties
 */

// eslint-disable-next-line no-unused-vars
function policy(args) {
	const { api, properties, trigger } = args;
	const {
		isReadOnly,
		showUploadInstruction,
		mode,
		isAttachmentUploadDisabled,
		isAttachmentEditDisabled
	} = properties;
	const showPrimaryUpfrontAction = !(isReadOnly || isAttachmentEditDisabled);
	api.updateVisibility('primaryUpfrontAction', showPrimaryUpfrontAction);
	if (mode === 'custom') {
		api.updateVisibility('showUploadInstruction', false);
		api.updateVisibility('primaryUpfrontAction', false);
	}
	if (
		(mode === 'full' || mode === 'compact') &&
		!isReadOnly &&
		!isAttachmentUploadDisabled
	) {
		api.updateValue('showUploadInstruction', 'autoGenerate');
		api.updateVisibility('showUploadInstruction', true);
		api.updateVisibility('primaryUpfrontAction', true);
	}
	if (mode === 'compact' && !isReadOnly && !isAttachmentUploadDisabled) {
		api.updateVisibility('showCompactModeDropZone', true);
		api.updateValue('showUploadInstruction', 'none');
	} else {
		api.updateVisibility('showCompactModeDropZone', false);
	}

	if (!trigger && showUploadInstruction !== 'custom') {
		api.updateVisibility('customUploadInstruction', false);
	} else if (trigger === 'isReadOnly') {
		if (isReadOnly) {
			api.updateVisibility('isAttachmentUploadDisabled', false);
			api.updateVisibility('isAttachmentEditDisabled', false);
		} else {
			api.updateVisibility('isAttachmentUploadDisabled', true);
			api.updateVisibility('isAttachmentEditDisabled', true);
		}
	}
	if (trigger === 'showUploadInstruction') {
		if (showUploadInstruction === 'custom') {
			api.updateVisibility('customUploadInstruction', true);
		} else {
			api.updateVisibility('customUploadInstruction', false);
		}
	}
}
