function removeUpdateSynch(attribs) {
	if (!attribs.length)
		return attribs;

	attribs = attribs.replace('update_synch=true', '')
					.replace('update_synch', '')
					.replace(',,', ',');

	if (attribs.substring(0,1).equals(","))
		attribs = attribs.substring(1);

	if (attribs.substring(attribs.length-1).equals(","))
		attribs = attribs.substring(0, attribs.length-1);
}


(function () {
	var gr = new GlideRecord('sys_dictionary');
	gr.addNullQuery('element');
	gr.addQuery('name', 'ui_notification_inbox');
	gr.query();
	while (gr.next()) {
		if (!gr.getED().hasAttribute("update_synch"))
			continue;

		var att = removeUpdateSynch(gr.attributes.toString());
		gr.setValue('attributes', att);
		gr.update();
	}
})();
