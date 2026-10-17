function onBefore(current, previous) {
   //This function will be automatically called when this rule is processed.
	var gr = new GlideRecord("sa_business_service_user_prefs");
	gr.addQuery("user", current.getUniqueValue);
	gr.query();
	gr.deleteMultiple();
   
}
