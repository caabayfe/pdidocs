var ids = [];
var gr = new GlideRecord('sys_metadata_delete_reference');
gr.addQuery('reference_cascade_rule', ['delete','cascade']);
var condition = gr.addQuery('sys_metadata_delete_ref_to', parent.sys_id);
gr.appendOrQuery(condition, 'sys_metadata_delete_related_to', '=', parent.sys_id);
gr.query();
while(gr.next())
	ids.push(gr.sys_reference_id.toString());
gr = new GlideRecord('sys_audit_delete');
gr.addQuery('documentkey', ids);
gr.query();
ids = [];
while(gr.next()) {
	var record = new GlideRecord('sys_metadata_delete');
	record.addQuery('sys_audit_delete', gr.sys_id);
	record.query();
	if(!record.next())
		ids.push(gr.sys_id.toString());
}
current.addQuery('sys_id', ids);
