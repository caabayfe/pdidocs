var snapshot = new GlideRecord("sys_pd_snapshot");
snapshot.query();
while (snapshot.next()) {
	if (isLatestSnapshot(snapshot) || isConnectedToContext(snapshot.sys_id))
		continue;

	snapshot.deleteRecord();
}

function isConnectedToContext(id) {
	var context = new GlideRecord("sys_pd_context");
	if (context.get("process_definition", id))
		return true;

	return false;
}

function isLatestSnapshot(record) {
	return record.source && record.source.snapshot == record.sys_id;
}
