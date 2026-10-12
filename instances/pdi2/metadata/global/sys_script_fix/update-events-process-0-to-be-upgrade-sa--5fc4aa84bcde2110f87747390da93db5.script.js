if (!pm.isZboot()){
	var grUpdate = new GlideRecord("sys_trigger");
	grUpdate.addQuery("sys_id", "437d0d5e8c351110579df12c251e726f")		// events process 0
	.addOrCondition('parent', "437d0d5e8c351110579df12c251e726f");
	grUpdate.addQuery("upgrade_safe", "false");
	grUpdate.query();
	while (grUpdate.next()) {
		grUpdate.upgrade_safe = true;
		grUpdate.update();
		gs.log("Update " + grUpdate.name + " to be runnable during system upgrade.");
	}
}
