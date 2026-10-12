
(function executeRule(current, previous /*null when async*/) {
	function checkSysStatus() {
		var gr = new GlideRecord("sys_status");
		gr.addQuery("name", "system.mysqld.version");
		gr.query();

		if (gr.next() && dbVersionSupportsInstant(gr.getValue("value"))) {
			updateProperty();
		}
	}

	function updateProperty() {
		var propertyName = "glide.db.instant_alter.enabled";
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name", propertyName);
		gr.query();

		if (gr.next()) {
			gr.setValue("value", "true");
			gr.update();
		} else {
			gr = new GlideRecord("sys_properties");
			gr.setValue("name", propertyName);
			gr.setValue("value", "true");
			gr.setValue("type", "boolean");
			gr.setValue("description", "Enable MariaDB INSTANT ALTER algorithms on the Now Platform");
			gr.insert();
		}

		disableScheduledJob();
	}

	function disableScheduledJob() {
		var gt = new GlideRecord("sysauto");
		gt.get("df6688b4535131100e67ddeeff7b12d1");
		gt.setValue("active", false);
		gt.update();
	}

	function dbVersionSupportsInstant(version) {
		var arr = version.split('.');
		if (arr.length >= 2)
			return Number(arr[0]) === 10 && Number(arr[1]) >= 4;

		return false;
	}

	checkSysStatus();
})(current, previous);
		
