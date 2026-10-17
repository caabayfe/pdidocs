(function () {
	var sysTriggerGr = new GlideRecord("sys_trigger");
	sysTriggerGr.addQuery("name", "SLA Async Delegator");
	sysTriggerGr.addQuery("script", "CONTAINS", "new SLAAsyncDelegator");
	sysTriggerGr.addQuery("sys_id", "!=", "0a95cf0557103300491d8f90ac94f92d");
	sysTriggerGr.orderBy("priority");
	sysTriggerGr.orderBy("repeat");
	sysTriggerGr.query();

	if (sysTriggerGr.next()) {
		var priority = 0 + sysTriggerGr.getValue("priority");
		var repeat = sysTriggerGr.repeat.dateNumericValue();
		
		if (priority < 100 || repeat !== 5000) {
			var sysTriggerGr2 = new GlideRecord("sys_trigger");
			if (sysTriggerGr2.get("0a95cf0557103300491d8f90ac94f92d")) {
				if (priority < 100)
					sysTriggerGr2.setValue("priority", priority);
				if (repeat !== 5000 && repeat >= 3000)
					sysTriggerGr2.repeat.setDateNumericValue(repeat);
				sysTriggerGr2.update();
			}
		}
		sysTriggerGr.deleteRecord();
	}
	
	while (sysTriggerGr.next())
		sysTriggerGr.deleteRecord();
})();
