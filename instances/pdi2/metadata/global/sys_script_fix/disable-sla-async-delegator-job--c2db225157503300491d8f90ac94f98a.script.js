(function () {
	var sysTriggerGr = new GlideRecord("sys_trigger");
	sysTriggerGr.addQuery("name", "SLA Async Delegator");
	sysTriggerGr.addQuery("script", "CONTAINS", "new SLAAsyncDelegator");
	sysTriggerGr.setValue("trigger_type", "2");
	sysTriggerGr.updateMultiple();
})();
