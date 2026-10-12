var ids = [];
var gr = new GlideRecord('sys_metadata_delete_reference');
gr.addQuery('reference_cascade_rule', ['delete','cascade']);
var condition = gr.addQuery('sys_metadata_delete_ref_to', parent.sys_id);
gr.appendOrQuery(condition, 'sys_metadata_delete_related_to', '=', parent.sys_id);
gr.query();
while(gr.next())
	ids.push(gr.sys_metadata_delete.toString());
gr = new GlideRecord('sys_metadata_delete');
gr.addQuery('sys_id', ids);
gr.query();
ids = [];
while(gr.next()) {
	if(!gr.sys_update_version.nil() || (!gr.sys_audit_delete.nil() && !gr.sys_audit_delete.payload.nil()))
		ids.push(gr.sys_id.toString());
}
current.addQuery('sys_metadata_delete', ids);
