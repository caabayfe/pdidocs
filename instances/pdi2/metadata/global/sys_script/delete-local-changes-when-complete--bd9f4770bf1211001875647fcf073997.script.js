//Since there is only 1 push allowed to a hub instance at 1 time, the instance is
//unique enough.
var changesGR = new GlideRecord("sys_sync_change");
changesGR.addQuery("instance", current.instance);
changesGR.addQuery("state", "queued");
changesGR.query();
while (changesGR.next())
	changesGR.deleteRecord();
