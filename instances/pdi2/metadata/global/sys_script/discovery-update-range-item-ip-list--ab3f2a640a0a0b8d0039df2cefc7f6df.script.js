(function executeRule(current, previous /*null when async*/) {
	// generate the summary field for this record...
	var summary = '';
	var gr = new GlideRecord('discovery_range_item_ip');
	if (current.item_parent)
		gr.addQuery('item_parent',current.item_parent);
	else
		gr.addQuery('exclude_parent',current.exclude_parent);
	gr.query();
	var text = [];
	var count = 0;
	while ((count < 3) && gr.next()) {
		if (count > 0)
			text.push(', ');
		text.push('' + gr.ip_address);
		count++;
	}
	if (gr.next())
		text.push('...');
	summary = text.join('');

	// update the parent item...
	if (current.item_parent) {
		var pgr = new GlideRecord('discovery_range_item');
		if (current.item_parent && pgr.get('sys_id', current.item_parent)) {
			pgr.summary = summary;
			pgr.update();
		}
	} else {
		pgr = new GlideRecord('discovery_range_item_exclude');
		if (current.exclude_parent && pgr.get('sys_id', current.exclude_parent)) {
			pgr.summary = summary;
			pgr.update();
		}
	}
})(current, previous);	
