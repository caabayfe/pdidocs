function onAfter(current, previous) {
	// delete all orphaned glide product image attachments
    var sysId = current.getValue('sys_id');
    var val = current.getValue('value');
    var imageLight = current.getValue('name') === 'glide.product.image.light';
    var imageField = imageLight ? 'banner_image_light' : 'banner_image';
    // remove extension
    var i = val.indexOf('.');
    if (i > -1)
	    val = val.substring(0, i);
    var gr = new GlideRecord('sys_attachment');
    gr.addQuery('table_name', 'ENDSWITH', 'sys_properties');
    gr.addQuery('table_sys_id', sysId);
    gr.addQuery('sys_id', '!=', val);
    gr.query();
    while (gr.next()) {
	    gr.deleteRecord();
    }

	// sync primary company image
	var gr = new GlideRecord('core_company');
    gr.addQuery('primary', 'true');
    gr.query();
	if (gr.next()) {
		// delete old primary core banner image if new sys property was added
		var gra = new GlideRecord('sys_attachment');
		gra.addQuery('table_sys_id', gr.sys_id);
		gra.addQuery('file_name', imageField);
		gra.query();
		if (gra.next()) {
			gra.deleteRecord();
		}

		// copy attachment to primary company
		var workflow = session.setWorkflow(false);
		var r = GlideSysAttachment.copy('sys_properties', current.sys_id, 'core_company', gr.sys_id, imageField);
		var generatedSysId = grabNewSysId(val, r);
		gr.setValue(imageField, generatedSysId);
		gr.update();
		session.setWorkflow(workflow);
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
