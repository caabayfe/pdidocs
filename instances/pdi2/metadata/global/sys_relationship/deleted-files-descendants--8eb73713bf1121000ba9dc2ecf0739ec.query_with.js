var ids = [];
var gr = new GlideRecord('sys_metadata_delete_related');
gr.addQuery('sys_metadata_delete_related_to', parent.sys_id);
gr.query();
while(gr.next())
	ids.push(gr.sys_metadata.toString());
gr = new GlideRecord('sys_metadata_delete');
gr.addQuery('sys_id', ids);
gr.addNotNullQuery('sys_update_version');
gr.query();
ids = [];
while(gr.next())
	ids.push(gr.sys_id.toString());
current.addQuery('sys_metadata', ids);
current.addQuery('sys_metadata_delete_related_to', parent.sys_id);
