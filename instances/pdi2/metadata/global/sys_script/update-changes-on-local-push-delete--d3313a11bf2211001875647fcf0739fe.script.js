//There can only be 1 push going on at a time, so all queued local changes
//for an instance are part of the history
var changesGR = new GlideRecord("sys_sync_change");
changesGR.addQuery("instance", current.instance);
changesGR.addQuery("state", "queued");
changesGR.query();
while (changesGR.next()) {
	changesGR.setValue("state", "pending_push");
	changesGR.update();
}
