var ff = new GlideRecord('sys_process_flow');
if (ff.get(current.sys_id)) {
	if (ff.canRead() && ff.canCreate())
		ff.insert();
}
