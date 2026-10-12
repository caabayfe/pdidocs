var model = current.name.toString();
if (model == 'sys_replication_queue')
	current.setAbortAction(true);
else
	deleteShards();

function deleteShards() {
	var table = (current.type === 'shard') ? 'sys_table_shard' : 'sys_table_rotation_schedule';
	
	var shardEntry = new GlideRecord(table);
	shardEntry.addQuery('name', current.sys_id);
	shardEntry.query();
	while (shardEntry.next()) {
		if (gs.nil(shardEntry.table_name))
			continue;

		if (shardEntry.table_name != current.name)
			gs.eventQueue("table_rotation.delete_extension", null, shardEntry.table_name, '');
	}
}
