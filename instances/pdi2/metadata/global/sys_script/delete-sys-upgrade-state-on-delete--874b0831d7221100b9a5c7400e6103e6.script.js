deleteUpgradeState();

function deleteUpgradeState() {
	var us = new GlideRecord("sys_upgrade_state");
	us.addQuery("name", current.name + ".xml");
	us.query();
	if (us.next()) {
		us.deleteRecord();
	}
}
