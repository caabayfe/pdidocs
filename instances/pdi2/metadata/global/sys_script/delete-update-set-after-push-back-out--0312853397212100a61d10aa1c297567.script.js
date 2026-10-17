var update_set = new GlideRecord("sys_update_set");
if (update_set.get(current.update_set))
	update_set.deleteRecord();
