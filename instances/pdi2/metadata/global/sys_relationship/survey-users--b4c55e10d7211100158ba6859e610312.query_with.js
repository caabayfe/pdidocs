var category;
var gr = new GlideRecord('asmt_metric_category');
gr.addQuery('metric_type', parent.sys_id);
gr.query();
if (gr.next())
	category = gr.sys_id;

current.addQuery('metric_category', category);
