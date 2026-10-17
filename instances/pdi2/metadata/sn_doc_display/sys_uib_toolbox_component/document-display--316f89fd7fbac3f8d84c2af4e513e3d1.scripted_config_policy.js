/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */

function policy(args) { //eslint-disable-line no-unused-vars
	const {api, trigger, properties} = args;
	const isAttachment = properties.documentType === 'attachment';
	const isHTML = properties.documentType === 'html';
	const enableEditing = properties.enableEditing === true;
	const resizable = properties.resizable === true;

	function updateAttachmentDependents(args) {
		const {api, properties} = args;
		const showToolbarProperties = properties.documentType === 'attachment' && !properties.hideToolbar;
		const isPdf = properties.documentType === 'attachment' && properties.attachmentType === 'pdf';
		const isImage = properties.documentType === 'attachment' && properties.attachmentType === 'image';
		api.updateVisibility('hideDownload', showToolbarProperties);
		api.updateVisibility('hideDelete', showToolbarProperties);
		api.updateVisibility('hideClose', showToolbarProperties);
		api.updateVisibility('hideSearch', isPdf && showToolbarProperties);
		api.updateVisibility('hideNavigation', isPdf && showToolbarProperties);
		api.updateVisibility('hideZoom', isPdf && showToolbarProperties);
		api.updateVisibility('hideRotation', isPdf && showToolbarProperties);
		api.updateVisibility('targetAttachmentId', isPdf);


		if (isPdf) {
			api.updateTypeMetadata('attachmentId', 'reference', {
				table: 'sys_attachment',
				referenceFilter: 'content_type=application/pdf'
			});
		} else if (isImage) {
			api.updateTypeMetadata('attachmentId', 'reference', {
				table: 'sys_attachment',
				referenceFilter: 'content_typeSTARTSWITHimage/'
			});
		}
	}

	if (!trigger || trigger === 'documentType') {
		api.updateVisibility('attachmentType', isAttachment);
		api.updateVisibility('attachmentId', isAttachment);
		api.updateVisibility('hideToolbar', isAttachment);
		updateAttachmentDependents(args);
		api.updateVisibility('htmlContent', isHTML);
		api.updateVisibility('enableEditing', isHTML);
		api.updateVisibility('allowBlockBasedAnchors', isHTML);
	}

	if (!trigger || trigger === 'hideToolbar' || trigger === 'attachmentType')
		updateAttachmentDependents(args);

	if (!trigger || trigger === 'documentType' || trigger === 'enableEditing') {
		api.updateVisibility('editorHeight', isHTML && enableEditing);
		api.updateVisibility('resizable', isHTML && enableEditing);
	}
	
	if (!trigger || trigger === 'documentType' || trigger === 'enableEditing' || trigger === 'resizable') 
		api.updateVisibility('editorMaxHeight', isHTML && enableEditing && resizable);
}
