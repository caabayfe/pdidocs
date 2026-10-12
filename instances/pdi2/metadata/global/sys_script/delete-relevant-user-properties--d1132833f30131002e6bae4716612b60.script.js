function onBefore(current, previous) {
   //This function will be automatically called when this rule is processed.
	var userSysId = GlideSession.get().getID();
	var gr = new GlideRecord("sa_business_service_user_prefs");
	gr.addQuery("service", current.getUniqueValue());
	gr.addQuery("user", userSysId);
	gr.query();
	gr.deleteMultiple();
}
