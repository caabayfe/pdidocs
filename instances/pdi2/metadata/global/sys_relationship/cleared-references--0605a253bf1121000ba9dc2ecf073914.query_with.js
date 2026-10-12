var ids = [];
var gr = new GlideRecord('sys_metadata_delete_reference');
var condition = gr.addQuery('sys_metadata_delete_ref_to', parent.sys_id);
gr.appendOrQuery(condition, 'sys_metadata_delete_related_to', '=', parent.sys_id);
gr.addQuery('reference_cascade_rule', 'clear');
gr.query();
while(gr.next()) {
	var record = new GlideRecord(gr.sys_db_object.toString());
	if(record.get(gr.sys_reference_id))
		ids.push(gr.sys_metadata_delete.toString());
}
current.addQuery('sys_metadata_delete', ids);
