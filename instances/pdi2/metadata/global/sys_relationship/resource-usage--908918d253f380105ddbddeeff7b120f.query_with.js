(function refineQuery(current, parent) {

	var sysIds = [ ];

	getTopicSysIds();
	getSysIds('mid_limited_resource_probe_m2m', 'probe');
	getSysIds('mid_limited_resource_pattern_m2m', 'pattern');

	current.addQuery('sys_id', 'IN', sysIds);

	function getTopicSysIds() {
		var gr = new GlideRecord('mid_limited_resource_topic');
		gr.addQuery('topic', parent.ecc_queue_topic);
		iterate(gr, 'resource.invert_topic', false);

		gr = new GlideRecord('mid_limited_resource_topic');
		gr.addQuery('topic', '!=', parent.ecc_queue_topic);
		iterate(gr, 'resource.invert_topic', true);
	}

	function getSysIds(table, type) {
		var gr = new GlideRecord(table),
			invertName = 'resource.invert_' + type;

		gr.addQuery(type, parent.sys_id);
		iterate(gr, invertName, false);

		gr = new GlideRecord(table);
		gr.addQuery(type, '!=', parent.sys_id);
		iterate(gr, invertName, true);
	}

	function iterate(gr, invertName, invert) {
		gr.addQuery(invertName, invert);
		gr.query();
		while (gr.next())
			sysIds.push('' + gr.sys_id);
	}

})(current, parent);
