if (pm.isZboot()) {
	var gr = new GlideRecord('sys_properties');
	if (gr.get('name', 'change.conflict.populateimpactedcis')) {
		gr.setValue('value', 'true');
		gr.update();
	}
	if (gr.get('name', 'change.conflict.identifymostcritical')) {
		gr.setValue('value', 'true');
		gr.update();
	}
	if (gr.get('name', 'change.conflict.relatedservices')) {
		gr.setValue('value', 'true');
		gr.update();
	}
}
