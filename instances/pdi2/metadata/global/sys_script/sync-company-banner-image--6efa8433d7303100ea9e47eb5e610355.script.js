function onAfter(current, previous) {
	// copy attachment to sys properties
	var bannerNew = current.getValue('file_name').indexOf('banner_image_light') > -1;
	var companyImageField = (bannerNew) ? 'banner_image_light' : 'banner_image';

	// grab sys prop
	var sysProp = new GlideRecord('sys_properties');
	if (bannerNew)
		sysProp.addQuery('name', 'glide.product.image.light');
	else
		sysProp.addQuery('name', 'glide.product.image');

	sysProp.query();
	if (!sysProp.next())
		return;

	var sysPropId = sysProp.getValue('sys_id');
	var copies = GlideSysAttachment.copy('core_company', current.table_sys_id, 'sys_properties', sysPropId, companyImageField);

	var generatedSysId = grabNewSysId(current.getValue('sys_id'), copies);
	// set property to use new attachment sys_id
	if (generatedSysId != null) {
		// update sys prop
		sysProp.value = generatedSysId + '.iix';
		sysProp.setWorkflow(false);
		sysProp.update();
		gs.updateSave(sysProp); // DEF0335946: ensure the modified value persists on upgrade

		// delete all orphaned glide product image attachments
		var attachments = new GlideRecord('sys_attachment');
		attachments.addQuery('table_name', 'ENDSWITH', 'sys_properties');
		attachments.addQuery('table_sys_id', sysPropId);
		attachments.addQuery('sys_id', '!=', generatedSysId);
		attachments.query();
		while (attachments.next())
			attachments.deleteRecord();
	}
}

// GlideSysAttachment.copy copies all the attachments found in a record and returns an array of the copies
// with the original attachments. We must iterate over the list and grab the correct copy to use
function grabNewSysId(sourceSysId, newSysIds) {
	for (var i = 0; i < newSysIds.size(); i++) {
		var ids = String(newSysIds.get(i));
		var parts = ids.split(',');
		if (parts[0] === sourceSysId)
			return parts[1];
	}
	
	return null;
}
