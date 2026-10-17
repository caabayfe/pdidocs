(function executeRule(current, previous /*null when async*/) {
	// generate the summary field for this record...
	var type = current.type;
	var summary = '';
	if (type == 'IP Address List') {
		var gr = new GlideRecord('discovery_range_item_ip');
		gr.addQuery('item_parent',current.sys_id);
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
	} else if (type == 'IP Address Range')
		summary = current.start_ip_address + '-' + current.end_ip_address;
	else if (type == 'IP Network')
		summary = current.network_ip + '/' + current.netmask;
	else if (type == 'Zone Transfer') {
		text = [];
		count = 0;

		gr = new GlideRecord('discovery_range_item_zone');
		gr.addQuery('item_parent',current.sys_id);
		gr.query();
		while ((count < 3) && gr.next()) {
			if (count > 0)
				text.push(', ');
			text.push('' + gr.domain);
			count++;
		}
		if (gr.next())
			text.push('...');
		summary = 'zone transfer ' + text.join('');
	}
	current.summary = summary;
	if (gs.nil(current.name))
		current.name = (summary.indexOf(',') < 0) ? summary : summary.split(',')[0] + '...';
})(current, previous);
