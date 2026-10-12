getXAxisList(current);

function getXAxisList(current) {
	var list = [];
	var gr = new GlideRecord('asmt_metric_category');
	gr.addQuery('metric_type', current.metric_type);
	gr.query();
	while (gr.next())
		list.push(gr.sys_id.toString());
	lookup.addQuery('sys_id', 'IN', list);
	gs.log(list);
}
