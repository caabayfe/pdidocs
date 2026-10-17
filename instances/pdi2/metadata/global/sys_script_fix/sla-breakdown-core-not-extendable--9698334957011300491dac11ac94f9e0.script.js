(function() {
	var sysDBObjectGr = new GlideRecord("sys_db_object");
	if (!sysDBObjectGr.get("name", "sla_breakdown_core"))
		return;

	sysDBObjectGr.setValue("is_extendable", false);
	sysDBObjectGr.update();
})();
